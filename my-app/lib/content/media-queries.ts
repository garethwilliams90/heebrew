import { isContentMediaPath, type MediaKind } from "@/lib/content/media";
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
    await Promise.all(
      paths.map(async (path) => {
        const { data: file, error: signError } = await service.storage.from("content-media").createSignedUrl(path, 60 * 60);
        if (!signError && file?.signedUrl) {
          signed.set(path, file.signedUrl);
        }
      }),
    );
    for (const row of rows) {
      const parentId = parent === "story" ? row.story_id : row.post_id;
      const url = signed.get(row.storage_path);
      if (!parentId || !url || !isKind(row.kind) || !isContentMediaPath(row.storage_path)) {
        continue;
      }
      const list = grouped.get(parentId) ?? [];
      list.push({ id: row.id, kind: row.kind, url, alt: row.alt_text });
      grouped.set(parentId, list);
    }
    return grouped;
  } catch {
    return grouped;
  }
}
