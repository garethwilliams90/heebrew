import { isContentMediaPath, type MediaKind } from "@/lib/content/media";
import { peekSignedUrl } from "@/lib/storage/signed-url";
import { createServiceClient } from "@/lib/supabase/service";

export type MediaView = {
  id: string;
  kind: MediaKind;
  url: string;
  alt: string;
};

type MediaRow = {
  id: string;
  story_id: string | null;
  post_id: string | null;
  kind: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
};

function isKind(value: string): value is MediaKind {
  return value === "image" || value === "gif" || value === "video";
}

export async function loadMediaMap(parent: "story" | "post", ids: string[]) {
  const grouped = new Map<string, MediaView[]>();
  if (ids.length === 0) {
    return grouped;
  }
  try {
    const service = createServiceClient();
    const column = parent === "story" ? "story_id" : "post_id";
    const { data, error } = await service
      .from("content_media")
      .select("id, story_id, post_id, kind, storage_path, alt_text, sort_order")
      .in(column, ids)
      .order("sort_order", { ascending: true });
    if (error || !data) {
      return grouped;
    }
    const rows = data as MediaRow[];
    const paths = rows.map((row) => row.storage_path).filter(isContentMediaPath);
    const signed = new Map<string, string>();
    if (paths.length > 0) {
      const created = await service.storage.from("content-media").createSignedUrls(paths, 60 * 60);
      for (const item of created.data ?? []) {
        if (item.path && item.signedUrl) {
          signed.set(item.path, item.signedUrl);
        }
      }
    }
    for (const row of rows) {
      const parentId = parent === "story" ? row.story_id : row.post_id;
      if (!parentId || !isKind(row.kind) || !isContentMediaPath(row.storage_path)) {
        continue;
      }
      const url = signed.get(row.storage_path) ?? peekSignedUrl("content-media", row.storage_path) ?? `/api/media/${row.id}`;
      const list = grouped.get(parentId) ?? [];
      list.push({ id: row.id, kind: row.kind, url, alt: row.alt_text });
      grouped.set(parentId, list);
    }
    return grouped;
  } catch {
    return grouped;
  }
}
