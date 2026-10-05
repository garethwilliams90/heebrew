import { synthesizeHebrew } from "@/lib/azure/speech";

const HEBREW = /\p{Script=Hebrew}/u;
const MAX_TEXTS = 40;
const MAX_CHARS = 200;

export async function POST(request: Request) {
  let texts: string[] = [];

  try {
    const body = (await request.json()) as { texts?: unknown };
    if (Array.isArray(body.texts)) {
      texts = body.texts.filter((text): text is string => typeof text === "string");
    }
  } catch {
    texts = [];
  }

  const unique = [
    ...new Set(
      texts
        .map((text) => text.trim())
        .filter((text) => text.length > 0 && text.length <= MAX_CHARS && HEBREW.test(text)),
    ),
  ];

  if (unique.length === 0 || texts.length > MAX_TEXTS) {
    return Response.json({ error: "Invalid Hebrew text" }, { status: 400 });
  }

  const settled = await Promise.allSettled(
    unique.map(async (text) => {
      const audio = await synthesizeHebrew(text);
      return {
        text,
        audio: Buffer.from(audio).toString("base64"),
      };
    }),
  );

  const clips = settled.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );

  if (clips.length === 0) {
    return Response.json({ error: "Speech failed" }, { status: 502 });
  }

  return Response.json({ clips });
}
