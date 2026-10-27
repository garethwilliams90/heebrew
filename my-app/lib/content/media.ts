export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 18 * 1024 * 1024;
export const MEDIA_LIMIT = 12;

export type MediaKind = "image" | "gif" | "video";
export type MediaExt = "jpg" | "png" | "webp" | "gif" | "mp4" | "webm";

export type MediaCheck =
  | { ok: true; ext: MediaExt; kind: MediaKind; contentType: string }
  | { ok: false; reason: "empty" | "size" | "type" };

const MIME_EXT = new Map<string, MediaExt>([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
]);

const NAME_EXT = new Map<string, MediaExt>([
  ["jpg", "jpg"],
  ["jpeg", "jpg"],
  ["png", "png"],
  ["webp", "webp"],
  ["gif", "gif"],
  ["mp4", "mp4"],
  ["webm", "webm"],
]);

const PATH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif|mp4|webm)$/;

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  if (bytes.length < offset + signature.length) {
    return false;
  }
  return signature.every((value, index) => bytes[offset + index] === value);
}

export function detectedMediaExt(bytes: Uint8Array): MediaExt | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return "jpg";
  }
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) {
    return "png";
  }
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) {
    return "gif";
  }
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return "webp";
  }
  if (startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])) {
    return "webm";
  }
  if (startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4)) {
    return "mp4";
  }
  return null;
}

export function kindForExt(ext: MediaExt): MediaKind {
  if (ext === "gif") return "gif";
  if (ext === "mp4" || ext === "webm") return "video";
  return "image";
}

export function contentTypeForMedia(ext: MediaExt) {
  if (ext === "jpg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "mp4") return "video/mp4";
  return "video/webm";
}

export function isContentMediaPath(value: string) {
  return PATH.test(value);
}

export function validateContentMedia(input: { bytes: Uint8Array; mime: string; name: string }): MediaCheck {
  if (input.bytes.byteLength === 0) {
    return { ok: false, reason: "empty" };
  }
  const fromBytes = detectedMediaExt(input.bytes);
  if (!fromBytes) {
    return { ok: false, reason: "type" };
  }
  const fromMime = MIME_EXT.get(input.mime.toLowerCase());
  const nameExt = input.name.split(".").pop()?.toLowerCase() ?? "";
  const fromName = NAME_EXT.get(nameExt);
  if ((fromMime && fromMime !== fromBytes) || (fromName && fromName !== fromBytes) || (!fromMime && !fromName)) {
    return { ok: false, reason: "type" };
  }
  const kind = kindForExt(fromBytes);
  const limit = kind === "video" ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
  if (input.bytes.byteLength > limit) {
    return { ok: false, reason: "size" };
  }
  return { ok: true, ext: fromBytes, kind, contentType: contentTypeForMedia(fromBytes) };
}
