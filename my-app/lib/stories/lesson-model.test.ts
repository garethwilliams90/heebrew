import assert from "node:assert/strict";
import test from "node:test";
import { lessonIsVisible, parseLessonInput } from "./lesson-model";

const lesson = {
  conceptHe: "לאכול",
  conceptEn: "to eat",
  conceptFr: "",
  conceptEs: "",
  titleEn: "The verb to eat",
  titleFr: "",
  titleEs: "",
  bodyEn: "לאכול means to eat.\n\nIt changes with the person.",
  bodyFr: "",
  bodyEs: "",
  examples: [{ hebrew: "הוא אוכל", en: "he eats", fr: "", es: "" }],
  levelIds: ["s3-l2"],
};

test("a lesson needs a concept, a title, and a body", () => {
  const parsed = parseLessonInput(lesson);
  assert.equal(parsed === "invalid", false);
  if (parsed === "invalid" || "clear" in parsed) {
    assert.fail("expected a lesson");
  }
  assert.equal(parsed.conceptHe, "לאכול");
  assert.equal(parsed.examples[0]?.hebrew, "הוא אוכל");
  assert.deepEqual(parsed.levelIds, ["s3-l2"]);
});

test("an empty form clears the lesson and keeps the chosen levels", () => {
  const parsed = parseLessonInput({
    conceptHe: "  ",
    conceptEn: "",
    conceptFr: "",
    conceptEs: "",
    titleEn: "",
    titleFr: "",
    titleEs: "",
    bodyEn: "",
    bodyFr: "",
    bodyEs: "",
    examples: [{ hebrew: "", en: "", fr: "", es: "" }],
    levelIds: ["s2-l4"],
  });
  assert.deepEqual(parsed, { clear: true, levelIds: ["s2-l4"] });
});

test("a half-written example is rejected", () => {
  assert.equal(parseLessonInput({ ...lesson, examples: [{ hebrew: "הוא", en: "", fr: "", es: "" }] }), "invalid");
  assert.equal(parseLessonInput({ ...lesson, levelIds: ["not a level"] }), "invalid");
});

test("a lesson is visible once it has a title or a body", () => {
  assert.equal(lessonIsVisible({ title: { en: "Eat" }, body: { en: "" } }), true);
  assert.equal(lessonIsVisible({ title: { en: "" }, body: { en: "" } }), false);
});
