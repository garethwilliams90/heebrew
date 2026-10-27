export function transcriptLines(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function pairedTranscript(hebrew: string, gloss: string) {
  const source = transcriptLines(hebrew);
  const target = transcriptLines(gloss);
  return source.map((line, index) => ({ hebrew: line, gloss: target[index] ?? "" }));
}
