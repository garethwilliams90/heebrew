"use server";

import { mediaPathsFor } from "@/lib/content/media-actions";
import { revalidateLocalized } from "@/lib/content/revalidate";
import { cleanRequired } from "@/lib/content/text";
import { slugFromTitle, uniqueSlug } from "@/lib/blog/slug";
import { requireOwner } from "@/lib/owner-session";
import { createServiceClient } from "@/lib/supabase/service";

export type PostActionState = {
  error: "" | "forbidden" | "invalid" | "storage";
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function savePost(_state: PostActionState, formData: FormData): Promise<PostActionState> {
  const owner = await requireOwner();
  if (!owner) {
    return { error: "forbidden" };
  }

  const title = cleanRequired(formData.get("title"), 160);
  const body = cleanRequired(formData.get("body"), 20000);
  const published = formData.get("published") === "true";
  const rawId = formData.get("id");
  const id = typeof rawId === "string" && rawId ? rawId.trim().toLowerCase() : "";
  if (!title || !body) {
    return { error: "invalid" };
  }
  if (id && !UUID.test(id)) {
    return { error: "invalid" };
  }

  const service = createServiceClient();
  let slug = slugFromTitle(title);
  let publishedAt: string | null = published ? new Date().toISOString() : null;
  if (id) {
    const { data, error } = await service.from("blog_posts").select("slug, published_at").eq("id", id).maybeSingle();
    if (error || !data) {
      return { error: "invalid" };
    }
    slug = data.slug;
    publishedAt = published ? (data.published_at ?? new Date().toISOString()) : null;
  } else {
    const { data, error } = await service.from("blog_posts").select("slug");
    if (error) {
      return { error: "storage" };
    }
    slug = uniqueSlug(slug, new Set((data ?? []).map((row) => row.slug)));
  }

  const row = {
    title,
    body,
    slug,
    published,
    published_at: publishedAt,
    author_id: owner.id,
  };
  const { error } = id
    ? await service.from("blog_posts").update(row).eq("id", id)
    : await service.from("blog_posts").insert(row);
  if (error) {
    return { error: "storage" };
  }

  revalidateLocalized("/blog");
  return { error: "" };
}

export async function deletePost(formData: FormData) {
  const owner = await requireOwner();
  if (!owner) {
    return;
  }
  const id = formData.get("id");
  if (typeof id !== "string" || !UUID.test(id)) {
    return;
  }
  const service = createServiceClient();
  let mediaPaths: string[] = [];
  try {
    mediaPaths = await mediaPathsFor("post", id);
  } catch {
    mediaPaths = [];
  }
  const { error } = await service.from("blog_posts").delete().eq("id", id);
  if (error) {
    return;
  }
  if (mediaPaths.length > 0) {
    await service.storage.from("content-media").remove(mediaPaths);
  }
  revalidateLocalized("/blog");
}
