const pending = new Map<string, Promise<HTMLAudioElement | null>>();

export function loadSpeechClip(text: string) {
  const existing = pending.get(text);
  if (existing) {
    return existing;
  }

  const request = fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
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

  pending.set(text, request);
  return request;
}
