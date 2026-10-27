import assert from "node:assert/strict";
import test from "node:test";
import { visibleToVisitor } from "./visibility";

test("visitors never see drafts", () => {
  assert.equal(visibleToVisitor(false, false), false);
  assert.equal(visibleToVisitor(true, false), true);
  assert.equal(visibleToVisitor(false, true), true);
});
