import { loadMediaMap, type MediaView } from "@/lib/content/media-queries";
import { notFound } from "next/navigation";
import { visibleToVisitor } from "@/lib/content/visibility";
import { requireOwner } from "@/lib/owner-session";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type PostView = {
  id: string;
  slug: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
  media: MediaView[];
};

type PostRow = {
  id: string;
  slug: string;
  title: string;
  body: string;
  published: boolean;
  published_at: string | null;
  updated_at: string;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toView(row: PostRow): PostView | null {
  if (!SLUG.test(row.slug)) {
    return null;
  }
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    body: row.body,
    published: row.published,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    media: [],
  };
}

export async function loadPosts() {
  const owner = await requireOwner();
  const rows = owner ? await loadAllPosts() : await loadPublishedPosts();
  const posts = await withMedia(rows.flatMap((row) => {
    const view = toView(row);
    return view && visibleToVisitor(view.published, Boolean(owner)) ? [view] : [];
  }));
  return {
    owner: Boolean(owner),
    posts,
  };
}

export async function loadPost(slug: string) {
  if (!SLUG.test(slug)) {
    notFound();
  }
  const owner = await requireOwner();
  const row = owner ? await loadAnyPost(slug) : await loadPublishedPost(slug);
  const view = row ? toView(row) : null;
  if (!view || !visibleToVisitor(view.published, Boolean(owner))) {
    notFound();
  }
  const [withFiles] = await withMedia([view]);
  return { owner: Boolean(owner), post: withFiles ?? view };
}

async function loadPublishedPosts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, body, published, published_at, updated_at")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error || !data) {
      return [];
    }
    return data as PostRow[];
  } catch {
    return [];
  }
}

async function loadAllPosts() {
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("blog_posts")
      .select("id, slug, title, body, published, published_at, updated_at")
      .order("created_at", { ascending: false });
    if (error || !data) {
      return [];
    }
    return data as PostRow[];
  } catch {
    return [];
  }
}

async function loadPublishedPost(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, body, published, published_at, updated_at")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    return data as PostRow;
  } catch {
    return null;
  }
}

async function loadAnyPost(slug: string) {
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("blog_posts")
      .select("id, slug, title, body, published, published_at, updated_at")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    return data as PostRow;
  } catch {
    return null;
  }
}

async function withMedia(posts: PostView[]) {
  const media = await loadMediaMap("post", posts.map((post) => post.id));
  return posts.map((post) => ({ ...post, media: media.get(post.id) ?? [] }));
}
