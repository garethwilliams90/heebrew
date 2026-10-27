const pending = new Map<string, Promise<HTMLAudioElement | null>>();

/** Plays a lesson recording. A leading slash is a file in `public`; other paths stay in the Duolingo bundle. */
export function loadBundleClip(path: string) {
  const existing = pending.get(path);
  if (existing) {
    return existing;
  }

  const src = path.startsWith("/") ? path : `/hebrew_duolingo_app_bundle/${path}`;
  const request = new Promise<HTMLAudioElement | null>((resolve) => {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.addEventListener("canplaythrough", () => resolve(audio), { once: true });
    audio.addEventListener("error", () => resolve(null), { once: true });
  });

  pending.set(path, request);
  return request;
}
