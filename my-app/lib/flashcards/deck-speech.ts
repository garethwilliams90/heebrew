export type SpeechClip = { text: string; audio: string };

const deckRequests = new Map<string, Promise<SpeechClip[]>>();

/** Reuses one in-flight request when the same Hebrew list is fetched twice. */
export function requestDeckSpeech(texts: string[]) {
  const key = texts.join("\n");
  const existing = deckRequests.get(key);

  if (existing) {
    return existing;
  }

  const request = fetch("/api/speech/deck", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts }),
  })
    .then(async (response) => {
      if (!response.ok) {
        deckRequests.delete(key);
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
    })
    .catch((error: unknown) => {
      deckRequests.delete(key);
      throw error;
    });

  deckRequests.set(key, request);
  return request;
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
