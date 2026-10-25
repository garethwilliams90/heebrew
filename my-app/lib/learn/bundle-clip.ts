const pending = new Map<string, Promise<HTMLAudioElement | null>>();

/** Plays a recording stored under `public/hebrew_duolingo_app_bundle`. */
export function loadBundleClip(path: string) {
  const existing = pending.get(path);
  if (existing) {
    return existing;
  }

  const request = new Promise<HTMLAudioElement | null>((resolve) => {
    const audio = new Audio(`/hebrew_duolingo_app_bundle/${path}`);
    audio.preload = "auto";
    audio.addEventListener("canplaythrough", () => resolve(audio), { once: true });
    audio.addEventListener("error", () => resolve(null), { once: true });
  });

  pending.set(path, request);
  return request;
}
