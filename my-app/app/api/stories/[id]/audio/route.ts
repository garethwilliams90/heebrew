import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/owner-session";
import { isStoryAudioPath, storyAudioUrl } from "@/lib/stories/audio";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!UUID.test(id)) {
    return new NextResponse(null, { status: 404 });
  }

  const supabase = await createClient();
  const published = await supabase.from("stories").select("audio_path, published").eq("id", id).maybeSingle();
  let row = published.data;

  if (!row) {
    if (!(await requireOwner())) {
      return new NextResponse(null, { status: 404 });
    }
    try {
      const service = createServiceClient();
      const hidden = await service.from("stories").select("audio_path, published").eq("id", id).maybeSingle();
      row = hidden.data;
    } catch {
      return new NextResponse(null, { status: 404 });
    }
  }

  if (!row || !isStoryAudioPath(row.audio_path) || (!row.published && !(await requireOwner()))) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.redirect(storyAudioUrl(row.audio_path), 302);
}
