import assert from "node:assert/strict";
import test from "node:test";
import { transcriptFromFastResult, wordsFromFastResult } from "./transcribe";

test("reads word times from a speech result", () => {
  assert.deepEqual(
    wordsFromFastResult({
      phrases: [{ words: [{ text: "שלום", offsetMilliseconds: 100, durationMilliseconds: 400 }] }],
    }),
    [{ text: "שלום", startMs: 100, endMs: 500 }],
  );
});

test("reads the Hebrew transcript from a speech result", () => {
  assert.equal(
    transcriptFromFastResult({
      combinedPhrases: [{ text: "  שלום  " }, { text: "מה נשמע" }],
    }),
    "שלום\nמה נשמע",
  );
  assert.equal(transcriptFromFastResult({}), "");
  assert.equal(transcriptFromFastResult(null), "");
});
