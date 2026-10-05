export async function translateToHebrew(texts: string[]) {
  const key = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION;

  if (!key || !region || texts.length === 0) {
    throw new Error("Translator is not configured");
  }

  const response = await fetch(
    "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=he",
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(texts.map((text) => ({ Text: text }))),
    },
  );

  if (!response.ok) {
    throw new Error("Translation failed");
  }

  const payload = (await response.json()) as {
    translations?: { text?: unknown }[];
  }[];

  return texts.map((_, index) => {
    const text = payload[index]?.translations?.[0]?.text;
    return typeof text === "string" ? text.trim() : "";
  });
}
