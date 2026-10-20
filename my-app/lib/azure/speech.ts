const VOICE = "he-IL-HilaNeural";

function escapeSsml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function synthesizeHebrew(text: string, phoneme?: string) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    throw new Error("Speech is not configured");
  }

  const spoken = phoneme
    ? `<phoneme alphabet="ipa" ph="${escapeSsml(phoneme)}">${escapeSsml(text)}</phoneme>`
    : escapeSsml(text);
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="he-IL"><voice name="${VOICE}">${spoken}</voice></speak>`;
  const response = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
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

  return response.arrayBuffer();
}
