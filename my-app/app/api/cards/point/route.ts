import { withAuth } from "@/lib/api/middleware";
import { ApiError, ApiResponse } from "@/lib/api/responses";
import { pointHebrew } from "@/lib/dicta/nakdan";

const TEXT_LIMIT = 400;
const MAX_TEXTS = 2;
const HEBREW = /\p{Script=Hebrew}/u;

export const POST = withAuth(async (request) => {
  let texts: string[] = [];

  try {
    const body = (await request.json()) as { texts?: unknown };
    if (Array.isArray(body.texts)) {
      texts = body.texts.filter((text): text is string => typeof text === "string");
    }
  } catch {
    texts = [];
  }

  if (texts.length === 0 || texts.length > MAX_TEXTS || texts.some((text) => text.length > TEXT_LIMIT)) {
    return ApiError.badRequest("Invalid Hebrew text");
  }

  try {
    const pointed = await Promise.all(
      texts.map(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || !HEBREW.test(trimmed)) {
          return text;
        }
        const reading = await pointHebrew(trimmed);
        return reading.text || text;
      }),
    );

    return ApiResponse.json({ texts: pointed });
  } catch {
    return ApiError.badGateway("Nikud failed");
  }
});
