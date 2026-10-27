import { resolveLessonAudio } from "@/lib/audio/lesson-audio";

const pending = new Map<string, Promise<HTMLAudioElement | null>>();

/** Plays a lesson recording from the lesson-audio bucket. */
export function loadBundleClip(path: string) {
  const existing = pending.get(path);
  if (existing) {
    return existing;
  }

  const src = resolveLessonAudio(path);
  const request = new Promise<HTMLAudioElement | null>((resolve) => {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.addEventListener("canplay", () => resolve(audio), { once: true });
    audio.addEventListener("error", () => resolve(null), { once: true });
  });

  pending.set(path, request);
  return request;
}
