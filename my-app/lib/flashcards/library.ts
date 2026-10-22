import { isBuiltinDeck, isUserCardId } from "@/lib/flashcards/builtin";
import type { SaveResult } from "@/lib/flashcards/progress";
import { isPartOfSpeech, type Flashcard, type GrammaticalGender, type PartOfSpeech } from "@/lib/flashcards/types";
import { CardRepository } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/client";

export type CardDraft = {
  english: string;
  partOfSpeech: PartOfSpeech;
  example: string;
  hebrew: string;
  hebrewExample: string;
  gender: GrammaticalGender | null;
};

const TITLE_LIMIT = 80;
const DESCRIPTION_LIMIT = 400;
const TEXT_LIMIT = 200;
const EXAMPLE_LIMIT = 400;

function trimDraft(draft: CardDraft): CardDraft | null {
  const english = draft.english.trim();
  const hebrew = draft.hebrew.trim();
  const example = draft.example.trim();
  const hebrewExample = draft.hebrewExample.trim();
  if (
    !english ||
    !hebrew ||
    english.length > TEXT_LIMIT ||
    hebrew.length > TEXT_LIMIT ||
    example.length > EXAMPLE_LIMIT ||
    hebrewExample.length > EXAMPLE_LIMIT ||
    !isPartOfSpeech(draft.partOfSpeech)
  ) {
    return null;
  }

  return {
    english,
    partOfSpeech: draft.partOfSpeech,
    example,
    hebrew,
    hebrewExample,
    gender: draft.gender,
  };
}

function cardRow(deckId: string, userId: string, draft: CardDraft, sourceCardId: string | null) {
  return {
    user_id: userId,
    deck_id: deckId,
    source_card_id: sourceCardId,
    english: draft.english,
    part_of_speech: draft.partOfSpeech,
    example: draft.example,
    hebrew: draft.hebrew,
    hebrew_example: draft.hebrewExample,
    gender: draft.gender,
    hidden: false,
  };
}

async function requireUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return { supabase, userId: data.user.id };
}

export async function createDeck(title: string, description: string): Promise<{ id: string } | SaveResult> {
  const name = title.trim();
  const about = description.trim();
  if (!name || name.length > TITLE_LIMIT || about.length > DESCRIPTION_LIMIT) {
    return "error";
  }

  const auth = await requireUser();
  if (!auth) {
    return "signed-out";
  }

  const { data, error } = await auth.supabase
    .from("decks")
    .insert({ user_id: auth.userId, title: name, description: about })
    .select("id")
    .single();

  if (error || typeof data?.id !== "string") {
    return "error";
  }

  return { id: data.id };
}

export async function updateDeck(
  deckId: string,
  title: string,
  description: string,
): Promise<SaveResult> {
  const name = title.trim();
  const about = description.trim();
  if (!name || name.length > TITLE_LIMIT || about.length > DESCRIPTION_LIMIT) {
    return "error";
  }

  const auth = await requireUser();
  if (!auth) {
    return "signed-out";
  }

  if (isBuiltinDeck(deckId)) {
    const { error } = await auth.supabase.from("deck_edits").upsert(
      {
        user_id: auth.userId,
        deck_id: deckId,
        title: name,
        description: about,
      },
      { onConflict: "user_id,deck_id" },
    );
    return error ? "error" : "ok";
  }

  const { error } = await auth.supabase
    .from("decks")
    .update({ title: name, description: about })
    .eq("user_id", auth.userId)
    .eq("id", deckId);

  return error ? "error" : "ok";
}

export async function deleteDeck(deckId: string): Promise<SaveResult> {
  if (isBuiltinDeck(deckId)) {
    return "error";
  }

  const auth = await requireUser();
  if (!auth) {
    return "signed-out";
  }

  const progress = await auth.supabase
    .from("card_progress")
    .delete()
    .eq("user_id", auth.userId)
    .eq("deck_id", deckId);
  if (progress.error) {
    return "error";
  }

  const cards = await auth.supabase.from("cards").delete().eq("user_id", auth.userId).eq("deck_id", deckId);
  if (cards.error) {
    return "error";
  }

  try {
    await removeStoredAudio(auth.supabase, auth.userId, deckId);
  } catch {
    // The deck is still removed when the recording bucket is unavailable.
  }

  const deck = await auth.supabase.from("decks").delete().eq("user_id", auth.userId).eq("id", deckId);
  return deck.error ? "error" : "ok";
}

export async function saveCard(
  deckId: string,
  cardId: string | null,
  draft: CardDraft,
): Promise<SaveResult> {
  const next = trimDraft(draft);
  if (!next) {
    return "error";
  }

  const auth = await requireUser();
  if (!auth) {
    return "signed-out";
  }

  const cards = new CardRepository(auth.supabase);

  if (cardId && isUserCardId(cardId)) {
    const { error } = await cards.updateOwned(auth.userId, cardId, next);
    return error ? "error" : "ok";
  }

  if (!cardId) {
    const { error } = await cards.insertNew(deckId, auth.userId, next);
    return error ? "error" : "ok";
  }

  const { error } = await cards.upsertSource(deckId, auth.userId, next, cardId);
  return error ? "error" : "ok";
}

export async function removeCard(deckId: string, card: Flashcard): Promise<SaveResult> {
  const auth = await requireUser();
  if (!auth) {
    return "signed-out";
  }

  const cards = new CardRepository(auth.supabase);
  const draft = {
    english: card.english,
    partOfSpeech: card.partOfSpeech,
    example: card.example,
    hebrew: card.hebrew,
    hebrewExample: card.hebrewExample,
    gender: card.gender,
  };

  if (isUserCardId(card.id)) {
    const progress = await auth.supabase
      .from("card_progress")
      .delete()
      .eq("user_id", auth.userId)
      .eq("deck_id", deckId)
      .eq("card_id", card.id);
    if (progress.error) {
      return "error";
    }

    const { error } = await cards.deleteOwned(auth.userId, card.id);
    if (!error) {
      try {
        await removeAudioUrls(auth.supabase, auth.userId, [card.audioUrl, card.exampleAudioUrl]);
      } catch {
        // The card row is already gone.
      }
    }
    return error ? "error" : "ok";
  }

  const { error } = await cards.upsertSource(deckId, auth.userId, draft, card.id, true);
  return error ? "error" : "ok";
}

const AUDIO_BUCKET = "card-audio";
const AUDIO_MARKER = "/storage/v1/object/public/card-audio/";

type AudioStorage = {
  storage: {
    from: (bucket: string) => {
      list: (path: string, options?: { limit?: number }) => Promise<{ data: { name: string }[] | null }>;
      remove: (paths: string[]) => Promise<unknown>;
    };
  };
};

async function removeStoredAudio(storage: AudioStorage, userId: string, deckId: string) {
  const folder = `${userId}/${deckId}`;
  for (let round = 0; round < 50; round += 1) {
    const listed = await storage.storage.from(AUDIO_BUCKET).list(folder, { limit: 100 });
    const names = listed.data?.map((file) => file.name).filter((name) => name.length > 0) ?? [];
    if (names.length === 0) {
      return;
    }

    await storage.storage.from(AUDIO_BUCKET).remove(names.map((name) => `${folder}/${name}`));
    if (names.length < 100) {
      return;
    }
  }
}

async function removeAudioUrls(storage: AudioStorage, userId: string, urls: (string | undefined)[]) {
  const paths = urls.flatMap((url) => {
    const path = audioObjectPath(url, userId);
    return path ? [path] : [];
  });
  if (paths.length === 0) {
    return;
  }

  await storage.storage.from(AUDIO_BUCKET).remove(paths);
}

function audioObjectPath(url: string | undefined, userId: string) {
  if (!url) {
    return null;
  }

  const index = url.indexOf(AUDIO_MARKER);
  if (index === -1) {
    return null;
  }

  const path = decodeURIComponent(url.slice(index + AUDIO_MARKER.length));
  if (!path.startsWith(`${userId}/`) || path.includes("..")) {
    return null;
  }

  return path;
}
