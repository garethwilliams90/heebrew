const pending = new Map<string, Promise<HTMLAudioElement | null>>();

export function loadSpeechClip(text: string, phoneme?: string) {
  const key = phoneme ? `${text}\u0000${phoneme}` : text;
  const existing = pending.get(key);
  if (existing) {
    return existing;
  }

  const request = fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(phoneme ? { text, phoneme } : { text }),
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
