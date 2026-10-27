export const STORY_AUDIO_MAX_BYTES = 20 * 1024 * 1024;

export type StoryAudioExt = "mp3" | "m4a" | "wav" | "webm";

export type StoryAudio =
  | { ok: true; ext: StoryAudioExt; contentType: string }
  | { ok: false; reason: "empty" | "size" | "type" };

const MIME_EXT = new Map<string, StoryAudioExt>([
  ["audio/mpeg", "mp3"],
  ["audio/mp3", "mp3"],
  ["audio/mp4", "m4a"],
  ["audio/x-m4a", "m4a"],
  ["audio/wav", "wav"],
  ["audio/wave", "wav"],
  ["audio/x-wav", "wav"],
  ["audio/webm", "webm"],
]);

const EXT_FROM_NAME = new Map<string, StoryAudioExt>([
  ["mp3", "mp3"],
  ["mp4", "m4a"],
  ["m4a", "m4a"],
  ["wav", "wav"],
  ["webm", "webm"],
]);

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  if (bytes.length < offset + signature.length) {
    return false;
  }
  return signature.every((value, index) => bytes[offset + index] === value);
}

function detectedExt(bytes: Uint8Array): StoryAudioExt | null {
  if (startsWith(bytes, [0x49, 0x44, 0x33]) || (bytes.length > 1 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) {
    return "mp3";
  }
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x41, 0x56, 0x45], 8)) {
    return "wav";
  }
  if (startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])) {
    return "webm";
  }
  if (startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4)) {
    return "m4a";
  }
  return null;
}

function contentTypeFor(ext: StoryAudioExt) {
  if (ext === "mp3") return "audio/mpeg";
  if (ext === "m4a") return "audio/mp4";
  if (ext === "wav") return "audio/wav";
  return "audio/webm";
}

export function validateStoryAudio(input: { bytes: Uint8Array; mime: string; name: string }): StoryAudio {
  if (input.bytes.byteLength === 0) {
    return { ok: false, reason: "empty" };
  }
  if (input.bytes.byteLength > STORY_AUDIO_MAX_BYTES) {
    return { ok: false, reason: "size" };
  }

  const fromMime = MIME_EXT.get(input.mime.toLowerCase());
  const nameExt = input.name.split(".").pop()?.toLowerCase() ?? "";
  const fromName = EXT_FROM_NAME.get(nameExt);
  const fromBytes = detectedExt(input.bytes);
  if (!fromBytes) {
    return { ok: false, reason: "type" };
  }
  if (fromMime && fromMime !== fromBytes) {
    return { ok: false, reason: "type" };
  }
  if (fromName && fromName !== fromBytes) {
    return { ok: false, reason: "type" };
  }
  if (!fromMime && !fromName) {
    return { ok: false, reason: "type" };
  }

  return { ok: true, ext: fromBytes, contentType: contentTypeFor(fromBytes) };
}

const AUDIO_PATH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp3|m4a|wav|webm)$/;

export function isStoryAudioPath(path: string) {
  return AUDIO_PATH.test(path);
}

export function contentTypeForStoryPath(path: string) {
  if (path.endsWith(".mp3")) return "audio/mpeg";
  if (path.endsWith(".m4a")) return "audio/mp4";
  if (path.endsWith(".wav")) return "audio/wav";
  return "audio/webm";
}
