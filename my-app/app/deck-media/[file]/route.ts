import path from "node:path";
import { readFile } from "node:fs/promises";

const mediaRoot = path.resolve(process.cwd(), "hebrew_deck_export/media");

export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params;
  const name = path.basename(file);

  if (!name || name !== file) {
    return new Response("Not found", { status: 404 });
  }

  const full = path.resolve(mediaRoot, name);

  if (!full.startsWith(`${mediaRoot}${path.sep}`)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await readFile(full);
    return new Response(data, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
