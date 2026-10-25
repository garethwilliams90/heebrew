import { recognizeHebrew } from "@/lib/azure/speech";
import { gradeUtterance } from "@/lib/learn/hebrew-text";
import { closestSoundPrompt, soundPromptById, transcriptMatchesPrompt } from "@/lib/learn/sound-exercises";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 750_000;
const RIFF = [0x52, 0x49, 0x46, 0x46];

function isWav(bytes: ArrayBuffer) {
  if (bytes.byteLength < 12) {
    return false;
  }
  const head = new Uint8Array(bytes, 0, 12);
  return RIFF.every((value, index) => head[index] === value) && head[8] === 0x57 && head[9] === 0x41 && head[10] === 0x56 && head[11] === 0x45;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.getUser();

  let promptId = "";
  let expected = "";
  let audio: ArrayBuffer | null = null;

  try {
    const form = await request.formData();
    const id = form.get("promptId");
    const target = form.get("expected");
    const file = form.get("audio");
    if (typeof id === "string") {
      promptId = id.trim();
    }
    if (typeof target === "string") {
      expected = target.trim();
    }
    if (file instanceof File) {
      if (file.size > MAX_BYTES) {
        return Response.json({ error: "Audio too large" }, { status: 413 });
      }
      audio = await file.arrayBuffer();
    }
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!audio || !isWav(audio) || (!expected && !soundPromptById(promptId))) {
    return Response.json({ error: "Invalid speech" }, { status: 400 });
  }

  try {
    const result = await recognizeHebrew(audio);
    if (expected) {
      let grade: "pass" | "close" | "miss" = "miss";
      for (const transcript of result.transcripts) {
        const next = gradeUtterance(expected, transcript);
        if (next === "pass") {
          grade = "pass";
          break;
        }
        if (next === "close") {
          grade = "close";
        }
      }
      return Response.json({ pass: grade !== "miss", close: grade === "close" });
    }

    const prompt = soundPromptById(promptId);
    if (!prompt) {
      return Response.json({ error: "Invalid speech" }, { status: 400 });
    }
    const match = result.transcripts.some((transcript) => transcriptMatchesPrompt(prompt, transcript));
    if (match) {
      return Response.json({ pass: true });
    }

    const joined = result.transcripts.join(" ");
    const closest = closestSoundPrompt(joined, prompt.id);
    return Response.json({
      pass: false,
      closest: closest?.hebrew,
    });
  } catch {
    return Response.json({ error: "Speech failed" }, { status: 502 });
  }
}
