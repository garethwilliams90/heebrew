import { createHash } from "node:crypto";
import { ANKI_NOTE_LIMIT, ANKI_PACKAGE_LIMIT, issueFor } from "@/lib/flashcards/anki-note";
import { readApkg, readApkgSounds, type AnkiCardPreview } from "@/lib/flashcards/apkg";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const TITLE_LIMIT = 80;
const DESCRIPTION_LIMIT = 400;
const INSERT_CHUNK = 100;
const BUCKET = "card-audio";
const AUDIO_EXTENSIONS = new Set(["mp3", "ogg", "oga", "wav", "m4a", "mp4", "webm", "aac", "flac"]);

const CONTENT_TYPE: Record<string, string> = {
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  webm: "audio/webm",
  aac: "audio/aac",
  flac: "audio/flac",
};

type IncomingCard = {
  id: string;
  english: string;
  hebrew: string;
  example: string;
  hebrewExample: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return Response.json({ error: "signed-out" }, { status: 401 });
  }

  let file: File | null = null;
  let title = "";
  let description = "";
  let cards: IncomingCard[] | null = null;

  try {
    const form = await request.formData();
    const value = form.get("file");
    if (value instanceof File) {
      file = value;
    }
    const payload = parsePayload(form.get("cards"));
    if (payload) {
      title = payload.title.trim();
      description = payload.description.trim();
      cards = payload.cards;
    }
  } catch {
    return Response.json({ error: "unreadable" }, { status: 400 });
  }

  if (!file || !file.name.toLowerCase().endsWith(".apkg") || !cards) {
    return Response.json({ error: "unreadable" }, { status: 400 });
  }

  if (file.size > ANKI_PACKAGE_LIMIT) {
    return Response.json({ error: "too-big" }, { status: 413 });
  }

  if (
    !title ||
    title.length > TITLE_LIMIT ||
    description.length > DESCRIPTION_LIMIT ||
    cards.length === 0 ||
    cards.length > ANKI_NOTE_LIMIT
  ) {
    return Response.json({ error: "unreadable" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  let notes: AnkiCardPreview[];
  try {
    notes = readApkg(bytes).decks.flatMap((deck) => deck.cards);
  } catch {
    return Response.json({ error: "unreadable" }, { status: 422 });
  }

  const byId = new Map(notes.map((card) => [card.id, card]));
  const chosen = cards.flatMap((card) => {
    const source = byId.get(card.id);
    const english = card.english.trim();
    const hebrew = card.hebrew.trim();
    const example = card.example.trim();
    const hebrewExample = card.hebrewExample.trim();
    if (!source || issueFor(english, hebrew, example, hebrewExample)) {
      return [];
    }

    return [
      {
        id: card.id,
        english,
        hebrew,
        example,
        hebrewExample,
        audioFile: source.audioFile,
        exampleAudioFile: source.exampleAudioFile,
      },
    ];
  });

  if (chosen.length !== cards.length || new Set(chosen.map((card) => card.id)).size !== chosen.length) {
    return Response.json({ error: "unreadable" }, { status: 422 });
  }

  const created = await supabase
    .from("decks")
    .insert({ user_id: data.user.id, title, description })
    .select("id")
    .single();

  if (created.error || typeof created.data?.id !== "string") {
    return Response.json({ error: "unreadable" }, { status: 422 });
  }

  const deckId = created.data.id;
  const uploaded: string[] = [];

  try {
    const urls = await uploadSounds(supabase, data.user.id, deckId, bytes, chosen, uploaded);
    for (let index = 0; index < chosen.length; index += INSERT_CHUNK) {
      const rows = chosen.slice(index, index + INSERT_CHUNK).map((card) => ({
        user_id: data.user.id,
        deck_id: deckId,
        source_card_id: null,
        english: card.english,
        part_of_speech: "phrase",
        example: card.example,
        hebrew: card.hebrew,
        hebrew_example: card.hebrewExample,
        gender: null,
        hidden: false,
        audio_url: card.audioFile ? (urls.get(card.audioFile) ?? null) : null,
        example_audio_url: card.exampleAudioFile ? (urls.get(card.exampleAudioFile) ?? null) : null,
      }));
      const inserted = await supabase.from("cards").insert(rows);
      if (inserted.error) {
        throw inserted.error;
      }
    }
  } catch {
    await supabase.storage.from(BUCKET).remove(uploaded);
    await supabase.from("cards").delete().eq("user_id", data.user.id).eq("deck_id", deckId);
    await supabase.from("decks").delete().eq("user_id", data.user.id).eq("id", deckId);
    return Response.json({ error: "unreadable" }, { status: 422 });
  }

  return Response.json({ id: deckId });
}

async function uploadSounds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  deckId: string,
  bytes: Buffer,
  cards: { audioFile: string | null; exampleAudioFile: string | null }[],
  uploaded: string[],
) {
  const names = [
    ...new Set(cards.flatMap((card) => [card.audioFile, card.exampleAudioFile].filter((name) => name && audioExtension(name)))),
  ] as string[];
  const sounds = readApkgSounds(bytes, names);
  const urls = new Map<string, string>();
  let cursor = 0;

  async function worker() {
    while (cursor < names.length) {
      const name = names[cursor];
      cursor += 1;
      const audio = sounds.get(name);
      const extension = audioExtension(name);
      if (!audio || !extension) {
        continue;
      }

      const path = `${userId}/${deckId}/${storageName(name, extension)}`;
      const result = await supabase.storage.from(BUCKET).upload(path, new Uint8Array(audio), {
        contentType: CONTENT_TYPE[extension] ?? "application/octet-stream",
        upsert: false,
      });
      if (result.error) {
        throw result.error;
      }

      uploaded.push(path);
      const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      if (url.length <= 1000) {
        urls.set(name, url);
      }
    }
  }

  const workers = Array.from({ length: Math.min(4, names.length) }, () => worker());
  await Promise.all(workers);
  return urls;
}

function storageName(fileName: string, extension: string) {
  const hash = createHash("sha256").update(fileName).digest("hex").slice(0, 12);
  return `${hash}.${extension}`;
}

function audioExtension(fileName: string) {
  const match = /\.([a-z0-9]{2,5})$/i.exec(fileName);
  const extension = match?.[1]?.toLowerCase() ?? "";
  return AUDIO_EXTENSIONS.has(extension) ? extension : "";
}

function parsePayload(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const body = parsed as { title?: unknown; description?: unknown; cards?: unknown };
  if (typeof body.title !== "string" || typeof body.description !== "string" || !Array.isArray(body.cards)) {
    return null;
  }

  const cards: IncomingCard[] = [];
  for (const card of body.cards) {
    if (!card || typeof card !== "object") {
      return null;
    }

    const item = card as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.english !== "string" || typeof item.hebrew !== "string") {
      return null;
    }

    cards.push({
      id: item.id,
      english: item.english,
      hebrew: item.hebrew,
      example: typeof item.example === "string" ? item.example : "",
      hebrewExample: typeof item.hebrewExample === "string" ? item.hebrewExample : "",
    });
  }

  return { title: body.title, description: body.description, cards };
}
