import { MAX_STUDY_COUNT } from "@/lib/flashcards/study-plan";

export type SpeechClip = { text: string; audio: string };

const SPEECH_BATCH = 40;
const clipCache = new Map<string, Promise<SpeechClip | null>>();
const warmedAudio = new Map<string, HTMLAudioElement>();

type SpokenCard = {
  hebrew: string;
  hebrewExample: string;
  audioUrl?: string;
  exampleAudioUrl?: string;
};

/** Reuses a clip already requested for the same Hebrew line, including one still in flight. */
export function requestDeckSpeech(texts: string[]) {
  const needed = [...new Set(texts.map((text) => text.trim()).filter((text) => text.length > 0))];
  const missing = needed.filter((text) => !clipCache.has(text));

  if (missing.length > 0) {
    const batches: string[][] = [];

    for (let index = 0; index < missing.length; index += SPEECH_BATCH) {
      batches.push(missing.slice(index, index + SPEECH_BATCH));
    }

    const request = Promise.all(batches.map((batch) => fetchSpeechBatch(batch)))
      .then((groups) => groups.flat())
      .catch((error: unknown) => {
        for (const text of missing) {
          clipCache.delete(text);
        }

        throw error;
      });

    for (const text of missing) {
      clipCache.set(
        text,
        request.then((clips) => {
          const found = clips.find((item) => item.text === text) ?? null;

          if (!found) {
            clipCache.delete(text);
          }

          return found;
        }),
      );
    }
  }

  return Promise.all(needed.map((text) => clipCache.get(text) ?? Promise.resolve(null))).then((clips) =>
    clips.filter((clip): clip is SpeechClip => clip !== null),
  );
}

function fetchSpeechBatch(texts: string[]) {
  return fetch("/api/speech/deck", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts }),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error("Speech failed");
    }

    const payload = (await response.json()) as {
      clips?: { text?: unknown; audio?: unknown }[];
    };

    return (payload.clips ?? []).flatMap((clip) =>
      typeof clip.text === "string" && typeof clip.audio === "string"
        ? [{ text: clip.text, audio: clip.audio }]
        : [],
    );
  });
}

/** Starts the audio a session of at most 20 cards can ask for. */
export function prefetchStudyAudio(cards: SpokenCard[]) {
  const upcoming = cards.slice(0, MAX_STUDY_COUNT);

  if (typeof Audio !== "undefined") {
    for (const card of upcoming) {
      for (const url of [card.audioUrl, card.exampleAudioUrl]) {
        if (!url || warmedAudio.has(url)) {
          continue;
        }

        const audio = new Audio();
        audio.preload = "auto";
        audio.src = url;
        warmedAudio.set(url, audio);
      }
    }
  }

  const texts = [
    ...new Set(
      upcoming.flatMap((card) => [
        card.audioUrl ? "" : card.hebrew,
        card.exampleAudioUrl ? "" : card.hebrewExample,
      ]),
    ),
  ].filter((text) => text.trim().length > 0);

  if (texts.length === 0) {
    return;
  }

  void requestDeckSpeech(texts).catch(() => {
    // The study session requests the same lines again if this one fails.
  });
}

/** Turns a base64 mp3 from the speech route into an audio element. Revokes the URL if it fails to load. */
export async function prepareSpeechClip(base64: string) {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
  const audio = new Audio(url);
  audio.preload = "auto";

  try {
    await new Promise<void>((resolve, reject) => {
      audio.addEventListener("canplaythrough", () => resolve(), { once: true });
      audio.addEventListener("error", () => reject(new Error("audio")), { once: true });
    });
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }

  return { url, audio };
}
