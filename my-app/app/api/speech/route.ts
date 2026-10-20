import { synthesizeHebrew } from "@/lib/azure/speech";
import { isLessonPhoneme } from "@/lib/alephbet/intro-alphabet";

const HEBREW = /\p{Script=Hebrew}/u;
const MAX_CHARS = 200;

export async function POST(request: Request) {
  let text = "";
  let phoneme = "";

  try {
    const body = (await request.json()) as { text?: unknown; phoneme?: unknown };
    if (typeof body.text === "string") {
      text = body.text.trim();
    }
    if (typeof body.phoneme === "string") {
      phoneme = body.phoneme.trim();
    }
  } catch {
    text = "";
  }

  if (!text || text.length > MAX_CHARS || !HEBREW.test(text) || (phoneme !== "" && !isLessonPhoneme(phoneme))) {
    return Response.json({ error: "Invalid Hebrew text" }, { status: 400 });
  }

  try {
    const audio = await synthesizeHebrew(text, phoneme || undefined);
    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return Response.json({ error: "Speech failed" }, { status: 502 });
  }
}
