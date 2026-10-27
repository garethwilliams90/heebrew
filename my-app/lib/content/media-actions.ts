"use server";

import { revalidateLocalized } from "@/lib/content/revalidate";
import { cleanOptional } from "@/lib/content/text";
import { isContentMediaPath, MEDIA_LIMIT, validateContentMedia } from "@/lib/content/media";
import { requireOwner } from "@/lib/owner-session";
import { createServiceClient } from "@/lib/supabase/service";

export type MediaActionState = {
  error: "" | "forbidden" | "invalid" | "media" | "storage";
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parentOf(formData: FormData) {
  const storyId = formData.get("storyId");
  const postId = formData.get("postId");
  const story = typeof storyId === "string" && UUID.test(storyId) ? storyId : "";
  const post = typeof postId === "string" && UUID.test(postId) ? postId : "";
  if ((story && post) || (!story && !post)) {
    return null;
  }
  return story ? { column: "story_id" as const, id: story, path: "/stories" as const } : { column: "post_id" as const, id: post, path: "/blog" as const };
}

export async function addMedia(_state: MediaActionState, formData: FormData): Promise<MediaActionState> {
  const owner = await requireOwner();
  if (!owner) {
    return { error: "forbidden" };
  }
  const parent = parentOf(formData);
  const alt = cleanOptional(formData.get("alt"), 200);
  const file = formData.get("file");
  if (!parent || alt === null || !(file instanceof File) || file.size === 0) {
    return { error: "invalid" };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const checked = validateContentMedia({ bytes, mime: file.type, name: file.name });
  if (!checked.ok) {
    return { error: "media" };
  }

  const service = createServiceClient();
  const { count, error: countError } = await service
    .from("content_media")
    .select("id", { count: "exact", head: true })
    .eq(parent.column, parent.id);
  if (countError || (count ?? 0) >= MEDIA_LIMIT) {
    return { error: "media" };
  }

  const storagePath = `${crypto.randomUUID()}.${checked.ext}`;
  const { error: uploadError } = await service.storage.from("content-media").upload(storagePath, bytes, {
    contentType: checked.contentType,
    upsert: false,
  });
  if (uploadError || !isContentMediaPath(storagePath)) {
    return { error: "storage" };
  }

  const inserted = parent.column === "story_id"
    ? await service.from("content_media").insert({
        story_id: parent.id,
        kind: checked.kind,
        storage_path: storagePath,
        alt_text: alt,
        sort_order: count ?? 0,
      })
    : await service.from("content_media").insert({
        post_id: parent.id,
        kind: checked.kind,
        storage_path: storagePath,
        alt_text: alt,
        sort_order: count ?? 0,
      });
  if (inserted.error) {
    await service.storage.from("content-media").remove([storagePath]);
    return { error: "storage" };
  }

  revalidateLocalized(parent.path);
  if (parent.column === "post_id") {
    const { data } = await service.from("blog_posts").select("slug").eq("id", parent.id).maybeSingle();
    if (data?.slug) {
      revalidateLocalized(`/blog/${data.slug}`);
    }
  }
  return { error: "" };
}

export async function removeMedia(formData: FormData) {
  const owner = await requireOwner();
  if (!owner) {
    return;
  }
  const id = formData.get("id");
  if (typeof id !== "string" || !UUID.test(id)) {
    return;
  }
  const service = createServiceClient();
  const { data } = await service.from("content_media").select("storage_path, story_id, post_id").eq("id", id).maybeSingle();
  if (!data || !isContentMediaPath(data.storage_path)) {
    return;
  }
  const { error } = await service.from("content_media").delete().eq("id", id);
  if (error) {
    return;
  }
  await service.storage.from("content-media").remove([data.storage_path]);
  revalidateLocalized(data.story_id ? "/stories" : "/blog");
  if (data.post_id) {
    const { data: post } = await service.from("blog_posts").select("slug").eq("id", data.post_id).maybeSingle();
    if (post?.slug) {
      revalidateLocalized(`/blog/${post.slug}`);
    }
  }
}

export async function mediaPathsFor(parent: "story" | "post", id: string) {
  const service = createServiceClient();
  const column = parent === "story" ? "story_id" : "post_id";
  const { data } = await service.from("content_media").select("storage_path").eq(column, id);
  return (data ?? []).flatMap((row) => (isContentMediaPath(row.storage_path) ? [row.storage_path] : []));
}
