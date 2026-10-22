import { recognizeHebrew } from "@/lib/azure/speech";
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
  let audio: ArrayBuffer | null = null;

  try {
    const form = await request.formData();
    const id = form.get("promptId");
    const file = form.get("audio");
    if (typeof id === "string") {
      promptId = id.trim();
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

  const prompt = soundPromptById(promptId);
  if (!prompt || !audio || !isWav(audio)) {
    return Response.json({ error: "Invalid speech" }, { status: 400 });
  }

  try {
    const result = await recognizeHebrew(audio);
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
