const speechHost = "api.cognitive.microsoft.com";

function speechConfig() {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    throw new Error("Speech is not configured");
  }
  return { key, region };
}

export type TimedWord = {
  text: string;
  startMs: number;
  endMs: number;
};

function milliseconds(ms: unknown, ticks: unknown) {
  if (typeof ms === "number" && Number.isFinite(ms)) {
    return Math.max(0, Math.round(ms));
  }
  if (typeof ticks === "number" && Number.isFinite(ticks)) {
    return Math.max(0, Math.round(ticks / 10_000));
  }
  return null;
}

/** Pulls word start and end times out of an Azure fast-transcription response. */
export function wordsFromFastResult(payload: unknown): TimedWord[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  const phrases = (payload as { phrases?: unknown }).phrases;
  if (!Array.isArray(phrases)) {
    return [];
  }
  const words: TimedWord[] = [];
  for (const phrase of phrases) {
    if (!phrase || typeof phrase !== "object") {
      continue;
    }
    const list = (phrase as { words?: unknown }).words;
    if (!Array.isArray(list)) {
      continue;
    }
    for (const word of list) {
      if (!word || typeof word !== "object") {
        continue;
      }
      const record = word as { text?: unknown; offsetMilliseconds?: unknown; durationMilliseconds?: unknown; offset?: unknown; duration?: unknown };
      const text = typeof record.text === "string" ? record.text.trim() : "";
      const startMs = milliseconds(record.offsetMilliseconds, record.offset);
      const durationMs = milliseconds(record.durationMilliseconds, record.duration);
      if (!text || startMs === null || durationMs === null) {
        continue;
      }
      words.push({ text, startMs, endMs: startMs + Math.max(durationMs, 1) });
    }
  }
  return words;
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

export async function transcribeHebrewDetail(bytes: Uint8Array, contentType: string, filename: string) {
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
  const payload: unknown = await response.json();
  const text = transcriptFromFastResult(payload);
  if (!text) {
    throw new Error("Transcription was empty");
  }
  return { text, words: wordsFromFastResult(payload) };
}

export async function transcribeHebrewAudio(bytes: Uint8Array, contentType: string, filename: string) {
  const detail = await transcribeHebrewDetail(bytes, contentType, filename);
  return detail.text;
}
