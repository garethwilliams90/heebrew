import { withAuth } from "@/lib/api/middleware";
import { ApiError, ApiResponse } from "@/lib/api/responses";
import { translateToHebrew } from "@/lib/azure/translate";
import { pointHebrew } from "@/lib/dicta/nakdan";

const TEXT_LIMIT = 200;
const EXAMPLE_LIMIT = 400;

export const POST = withAuth(async (request) => {
  let english = "";
  let example = "";

  try {
    const body = (await request.json()) as { english?: unknown; example?: unknown };
    if (typeof body.english === "string") {
      english = body.english.trim();
    }
    if (typeof body.example === "string") {
      example = body.example.trim();
    }
  } catch {
    english = "";
  }

  if (!english || english.length > TEXT_LIMIT || example.length > EXAMPLE_LIMIT) {
    return ApiError.badRequest("Invalid card");
  }

  try {
    const texts = example ? [english, example] : [english];
    const translated = await translateToHebrew(texts);
    const hebrew = translated[0] ?? "";
    if (!hebrew) {
      return ApiError.badGateway("Translation failed");
    }

    let pointed = hebrew;
    let gender: "masculine" | "feminine" | null = null;
    let hebrewExample = translated[1] ?? "";

    try {
      const reading = await pointHebrew(hebrew);
      if (reading.text) {
        pointed = reading.text;
      }
      gender = reading.gender;
    } catch {
      pointed = hebrew;
    }

    if (hebrewExample) {
      try {
        const reading = await pointHebrew(hebrewExample);
        if (reading.text) {
          hebrewExample = reading.text;
        }
      } catch {
        hebrewExample = translated[1] ?? "";
      }
    }

    return ApiResponse.json({
      hebrew: pointed,
      hebrewExample,
      gender,
    });
  } catch {
    return ApiError.badGateway("Translation failed");
  }
});
