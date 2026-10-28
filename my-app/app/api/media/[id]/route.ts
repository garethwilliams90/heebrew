import { NextResponse } from "next/server";
import { isContentMediaPath } from "@/lib/content/media";
import { requireOwner } from "@/lib/owner-session";
import { cachedSignedUrl } from "@/lib/storage/signed-url";
import { createServiceClient } from "@/lib/supabase/service";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!UUID.test(id)) {
    return new NextResponse(null, { status: 404 });
  }
  try {
    const service = createServiceClient();
    const { data } = await service.from("content_media").select("storage_path, story_id, post_id").eq("id", id).maybeSingle();
    if (!data || !isContentMediaPath(data.storage_path)) {
      return new NextResponse(null, { status: 404 });
    }
    const [story, post] = await Promise.all([
      data.story_id ? service.from("stories").select("published").eq("id", data.story_id).maybeSingle() : Promise.resolve(null),
      data.post_id ? service.from("blog_posts").select("published").eq("id", data.post_id).maybeSingle() : Promise.resolve(null),
    ]);
    const published = Boolean(story?.data?.published || post?.data?.published);
    if (!published && !(await requireOwner())) {
      return new NextResponse(null, { status: 404 });
    }
    const url = await cachedSignedUrl("content-media", data.storage_path);
    if (!url) {
      return new NextResponse(null, { status: 404 });
    }
    const response = NextResponse.redirect(url, 302);
    response.headers.set("Cache-Control", "private, max-age=600");
    return response;
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
