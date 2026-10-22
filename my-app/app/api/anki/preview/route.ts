import { withAuth } from "@/lib/api/middleware";
import { ApiError, ApiResponse } from "@/lib/api/responses";
import { ANKI_PACKAGE_LIMIT } from "@/lib/flashcards/anki-note";
import { AnkiPackageError, readApkg } from "@/lib/flashcards/apkg";

export const runtime = "nodejs";

export const POST = withAuth(async (request) => {
  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (value instanceof File) {
      file = value;
    }
  } catch {
    return ApiError.badRequest("unreadable");
  }

  if (!file || !file.name.toLowerCase().endsWith(".apkg")) {
    return ApiError.badRequest("not-apkg");
  }

  if (file.size > ANKI_PACKAGE_LIMIT) {
    return ApiError.payloadTooLarge("too-big");
  }

  try {
    const preview = readApkg(Buffer.from(await file.arrayBuffer()));
    return ApiResponse.json(preview);
  } catch (caught) {
    const code = caught instanceof AnkiPackageError ? caught.code : "unreadable";
    return ApiError.unprocessable(code);
  }
}, "signed-out");
