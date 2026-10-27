const bucket = "lesson-audio";

/** Old `public/` folders, and the storage prefix each one was uploaded under. */
const movedFolders: Record<string, string> = {
  "level_16-21": "recordings/level-16-21",
  "numbers 2": "recordings/numbers-2",
  pronouns_mp3s: "recordings/pronouns",
  pronouns_part2: "recordings/pronouns-part-2",
  two_letter_words_mp3s: "recordings/two-letter-words",
};

/** Public URL for a clip in the lesson-audio bucket. Paths are storage keys, not local files. */
export function lessonAudioUrl(objectPath: string) {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const encoded = objectPath.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}

/**
 * Turns a lesson clip into a public storage URL.
 * Absolute URLs are left alone. A leading slash is an old `public/` path.
 * Anything else is a Duolingo bundle path.
 */
export function resolveLessonAudio(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  let decoded = path.replace(/^\/+/, "");
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep the raw path when it is not valid percent-encoding.
  }

  const slash = decoded.indexOf("/");
  const folder = slash === -1 ? decoded : decoded.slice(0, slash);
  const rest = slash === -1 ? "" : decoded.slice(slash + 1);
  const moved = movedFolders[folder];

  if (moved && rest) {
    return lessonAudioUrl(`${moved}/${rest}`);
  }

  if (path.startsWith("/")) {
    return lessonAudioUrl(decoded);
  }

  return lessonAudioUrl(`duolingo/${decoded}`);
}
