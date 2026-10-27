const speechHost = "api.cognitive.microsoft.com";

function speechConfig() {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    throw new Error("Speech is not configured");
  }
  return { key, region };
}

/** Pulls the Hebrew text out of an Azure fast-transcription response. */
export function transcriptFromFastResult(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }
  const phrases = (payload as { combinedPhrases?: { text?: unknown }[] }).combinedPhrases ?? [];
  return phrases
    .map((phrase) => (typeof phrase.text === "string" ? phrase.text.trim() : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function transcribeHebrewAudio(bytes: Uint8Array, contentType: string, filename: string) {
  const { key, region } = speechConfig();
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  const form = new FormData();
  form.append("audio", new Blob([copy], { type: contentType }), filename);
  form.append("definition", JSON.stringify({ locales: ["he-IL"] }));

  const response = await fetch(
    `https://${region}.${speechHost}/speechtotext/transcriptions:transcribe?api-version=2024-11-15`,
    {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": key },
      body: form,
    },
  );
  if (!response.ok) {
    throw new Error("Transcription failed");
  }
  const text = transcriptFromFastResult(await response.json());
  if (!text) {
    throw new Error("Transcription was empty");
  }
  return text;
}
