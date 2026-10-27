import assert from "node:assert/strict";
import test from "node:test";
import { transcriptFromFastResult } from "./transcribe";

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
