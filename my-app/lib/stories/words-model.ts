const PHRASE_MAX = 200;

export function phraseInTranscript(transcript: string, phrase: string) {
  const text = phrase.replace(/\s+/g, " ").trim();
  if (!text || text.length > PHRASE_MAX || text.includes("\0")) {
    return "";
  }
  return transcript.replace(/\s+/g, " ").includes(text) ? text : "";
}

export function deckTitle(storyTitle: string) {
  const title = storyTitle.trim().slice(0, 80);
  return title || "Story words";
}
