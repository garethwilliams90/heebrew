import { speechText } from "@/lib/learn/hebrew-text";

const pending = new Map<string, Promise<HTMLAudioElement | null>>();

export function loadSpeechClip(text: string, phoneme?: string) {
  const spoken = phoneme ? text : speechText(text);
  const key = phoneme ? `${spoken}\u0000${phoneme}` : spoken;
  const existing = pending.get(key);
  if (existing) {
    return existing;
  }

  const request = fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(phoneme ? { text: spoken, phoneme } : { text: spoken }),
  })
    .then(async (response) => {
      if (!response.ok) {
        return null;
      }

      const url = URL.createObjectURL(await response.blob());
      const audio = new Audio(url);
      audio.preload = "auto";
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener("canplaythrough", () => resolve(), { once: true });
        audio.addEventListener("error", () => reject(new Error("audio")), { once: true });
      });
      return audio;
    })
    .catch(() => null);

  pending.set(key, request);
  return request;
}
