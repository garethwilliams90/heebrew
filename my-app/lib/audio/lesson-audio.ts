const bucket = "lesson-audio";

/** Public URL for a clip in the lesson-audio bucket. Paths are storage keys, not local files. */
export function lessonAudioUrl(objectPath: string) {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const encoded = objectPath.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}
