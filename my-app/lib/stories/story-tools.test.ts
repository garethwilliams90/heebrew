import assert from "node:assert/strict";
import test from "node:test";
import { formatClock, nearestRate, nextTime, PLAYBACK_RATES } from "./playback";
import { pairedTranscript } from "./lines";
import { phraseInTranscript } from "./words-model";
import { parseQuiz } from "./quiz-model";

test("playback rates run from 0.5 to 2 in tenths", () => {
  assert.equal(PLAYBACK_RATES[0], 0.5);
  assert.equal(PLAYBACK_RATES.at(-1), 2);
  assert.equal(PLAYBACK_RATES.length, 16);
  assert.equal(nearestRate(1.26), 1.3);
  assert.equal(nextTime(10, -15, 40), 0);
  assert.equal(nextTime(10, 15, 20), 20);
  assert.equal(formatClock(65), "1:05");
});

test("a translation sits on the same line as the Hebrew", () => {
  const pairs = pairedTranscript("שלום\r\n\r\nעולם", "Hello\n\nWorld");
  assert.deepEqual(pairs, [
    { hebrew: "שלום", gloss: "Hello" },
    { hebrew: "עולם", gloss: "World" },
  ]);
  assert.equal(pairedTranscript("שלום", "")[0]?.gloss, "");
});

test("a labeled phrase must appear in the transcript", () => {
  assert.equal(phraseInTranscript("שלום עולם", "עולם"), "עולם");
  assert.equal(phraseInTranscript("שלום\nעולם", "שלום עולם"), "שלום עולם");
  assert.equal(phraseInTranscript("שלום עולם", "חתול"), "");
});

test("a quiz needs one correct choice among at least two answers", () => {
  const quiz = parseQuiz([
    { prompt: "Who arrived?", choices: [{ text: "Dana", correct: true }, { text: "Yonatan", correct: false }] },
  ]);
  assert.equal(quiz?.length, 1);
  assert.equal(parseQuiz([{ prompt: "Who?", choices: [{ text: "Dana", correct: true }] }]), null);
  assert.equal(
    parseQuiz([{ prompt: "Who?", choices: [{ text: "Dana", correct: true }, { text: "Noa", correct: true }] }]),
    null,
  );
});
