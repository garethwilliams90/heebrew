import { pointHebrew } from "@/lib/dicta/nakdan";
import { createClient } from "@/lib/supabase/server";

const TEXT_LIMIT = 400;
const MAX_TEXTS = 2;
const HEBREW = /\p{Script=Hebrew}/u;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

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
    return Response.json({ error: "Invalid Hebrew text" }, { status: 400 });
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

    return Response.json({ texts: pointed });
  } catch {
    return Response.json({ error: "Nikud failed" }, { status: 502 });
  }
}
