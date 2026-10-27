import { createHash } from "node:crypto";
import path from "node:path";
import { lessonAudioUrl } from "@/lib/audio/lesson-audio";

function storageName(name: string) {
  if (/^[A-Za-z0-9._-]+$/.test(name)) return name;
  const ext = path.extname(name) || ".mp3";
  const hash = createHash("sha256").update(name).digest("hex").slice(0, 20);
  return `${hash}${ext}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> },
) {
  const { file: raw } = await context.params;
  let file = raw;
  try {
    file = decodeURIComponent(raw);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const name = path.basename(file);
  if (!name || name !== file || !name.toLowerCase().endsWith(".mp3")) {
    return new Response("Not found", { status: 404 });
  }

  return Response.redirect(lessonAudioUrl(`deck-export/${storageName(name)}`), 307);
}
