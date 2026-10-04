import { synthesizeHebrew } from "@/lib/azure/speech";

const HEBREW = /\p{Script=Hebrew}/u;
const MAX_CHARS = 80;

export async function POST(request: Request) {
  let text = "";

  try {
    const body = (await request.json()) as { text?: unknown };
    if (typeof body.text === "string") {
      text = body.text.trim();
    }
  } catch {
    text = "";
  }

  if (!text || text.length > MAX_CHARS || !HEBREW.test(text)) {
    return Response.json({ error: "Invalid Hebrew text" }, { status: 400 });
  }

  try {
    const audio = await synthesizeHebrew(text);
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
