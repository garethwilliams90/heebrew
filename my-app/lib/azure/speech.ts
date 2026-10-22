const VOICE = "he-IL-HilaNeural";
const ttsCache = new Map<string, ArrayBuffer>();

function speechConfig() {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    throw new Error("Speech is not configured");
  }
  return { key, region };
}

function escapeSsml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cacheKey(text: string, phoneme?: string) {
  return phoneme ? `${text}\u0000${phoneme}` : text;
}

export async function synthesizeHebrew(text: string, phoneme?: string) {
  const key = cacheKey(text, phoneme);
  const cached = ttsCache.get(key);
  if (cached) {
    return cached.slice(0);
  }

  const { key: speechKey, region } = speechConfig();
  const spoken = phoneme
    ? `<phoneme alphabet="ipa" ph="${escapeSsml(phoneme)}">${escapeSsml(text)}</phoneme>`
    : escapeSsml(text);
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="he-IL"><voice name="${VOICE}">${spoken}</voice></speak>`;
  const response = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": speechKey,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        "User-Agent": "webrew",
      },
      body: ssml,
    },
  );

  if (!response.ok) {
    throw new Error("Speech request failed");
  }

  const audio = await response.arrayBuffer();
  ttsCache.set(key, audio);
  return audio.slice(0);
}

type RecognitionNBest = { Display?: string; Lexical?: string; ITN?: string };

type RecognitionBody = {
  RecognitionStatus?: string;
  DisplayText?: string;
  NBest?: RecognitionNBest[];
};

export async function recognizeHebrew(audio: ArrayBuffer) {
  const { key, region } = speechConfig();
  const response = await fetch(
    `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=he-IL&format=detailed`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        Accept: "application/json",
      },
      body: audio,
    },
  );

  if (!response.ok) {
    throw new Error("Speech recognition failed");
  }

  const data = (await response.json()) as RecognitionBody;
  const transcripts = [
    data.DisplayText ?? "",
    ...(data.NBest?.flatMap((item) => [item.Display ?? "", item.Lexical ?? "", item.ITN ?? ""]) ?? []),
  ].filter((line) => line.length > 0);

  return {
    status: data.RecognitionStatus ?? "",
    transcripts,
  };
}
