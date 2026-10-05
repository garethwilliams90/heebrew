import { translateToHebrew } from "@/lib/azure/translate";
import { pointHebrew } from "@/lib/dicta/nakdan";
import { createClient } from "@/lib/supabase/server";

const TEXT_LIMIT = 200;
const EXAMPLE_LIMIT = 400;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

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
    return Response.json({ error: "Invalid card" }, { status: 400 });
  }

  try {
    const texts = example ? [english, example] : [english];
    const translated = await translateToHebrew(texts);
    const hebrew = translated[0] ?? "";
    if (!hebrew) {
      return Response.json({ error: "Translation failed" }, { status: 502 });
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

    return Response.json({
      hebrew: pointed,
      hebrewExample,
      gender,
    });
  } catch {
    return Response.json({ error: "Translation failed" }, { status: 502 });
  }
}
