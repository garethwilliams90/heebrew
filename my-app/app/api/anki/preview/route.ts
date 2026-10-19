import { ANKI_PACKAGE_LIMIT } from "@/lib/flashcards/anki-note";
import { AnkiPackageError, readApkg } from "@/lib/flashcards/apkg";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return Response.json({ error: "signed-out" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (value instanceof File) {
      file = value;
    }
  } catch {
    return Response.json({ error: "unreadable" }, { status: 400 });
  }

  if (!file || !file.name.toLowerCase().endsWith(".apkg")) {
    return Response.json({ error: "not-apkg" }, { status: 400 });
  }

  if (file.size > ANKI_PACKAGE_LIMIT) {
    return Response.json({ error: "too-big" }, { status: 413 });
  }

  try {
    const preview = readApkg(Buffer.from(await file.arrayBuffer()));
    return Response.json(preview);
  } catch (caught) {
    const code = caught instanceof AnkiPackageError ? caught.code : "unreadable";
    return Response.json({ error: code }, { status: 422 });
  }
}
