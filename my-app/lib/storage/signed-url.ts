import { createServiceClient } from "@/lib/supabase/service";

const cache = new Map<string, { url: string; expiresAt: number }>();

/** A signed URL that is still valid for several minutes, without calling storage. */
export function peekSignedUrl(bucket: string, path: string) {
  const hit = cache.get(`${bucket}:${path}`);
  if (!hit || hit.expiresAt < Date.now() + 5 * 60 * 1000) {
    return null;
  }
  return hit.url;
}

/** Signs a private object and remembers the URL until it is close to expiring. */
export async function cachedSignedUrl(bucket: string, path: string, seconds = 60 * 60) {
  const peeked = peekSignedUrl(bucket, path);
  if (peeked) {
    return peeked;
  }
  try {
    const service = createServiceClient();
    const { data, error } = await service.storage.from(bucket).createSignedUrl(path, seconds);
    if (error || !data?.signedUrl) {
      return null;
    }
    cache.set(`${bucket}:${path}`, { url: data.signedUrl, expiresAt: Date.now() + seconds * 1000 });
    return data.signedUrl;
  } catch {
    return null;
  }
}
