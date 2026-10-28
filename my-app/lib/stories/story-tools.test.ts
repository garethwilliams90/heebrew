import assert from "node:assert/strict";
import test from "node:test";
import { formatClock, nearestRate, nextTime, PLAYBACK_RATES } from "./playback";
import { activeToken, alignCues, keywordMask } from "./cues";
import { glossUnderHebrew, pairedTranscript } from "./lines";
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

test("spoken words line up with the transcript and keywords stay marked", () => {
  const cues = alignCues(
    ["שלום", "עולם"],
    [
      { text: "שלום", startMs: 0, endMs: 400 },
      { text: "עולם", startMs: 400, endMs: 900 },
    ],
    900,
  );
  assert.deepEqual(cues, [
    { startMs: 0, endMs: 400 },
    { startMs: 400, endMs: 900 },
  ]);
  assert.equal(activeToken(cues, 450), 1);
  assert.deepEqual(keywordMask(["גרייס", "אוהבת", "גזר"], ["גרייס אוהבת", "גזר"]), [true, true, true]);
  assert.deepEqual(keywordMask(["הסיפור", "ודגולה", "ובערב"], ["סיפור", "דגולה", "בערב"]), [true, true, true]);
});

test("a translation sits on the same line as the Hebrew", () => {
  const pairs = pairedTranscript("שלום\r\n\r\nעולם", "Hello\n\nWorld");
  assert.deepEqual(pairs, [
    { hebrew: "שלום", gloss: "Hello" },
    { hebrew: "עולם", gloss: "World" },
  ]);
  assert.equal(pairedTranscript("שלום", "")[0]?.gloss, "");
  const slots = glossUnderHebrew(["שלום,", "היום"], "Hello, today", ["today"]);
  assert.equal(slots[0]?.words[0]?.text, "Hello,");
  assert.equal(slots[0]?.words[0]?.keyword, false);
  assert.equal(slots[1]?.words[0]?.text, "today");
  assert.equal(slots[1]?.words[0]?.keyword, true);
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
