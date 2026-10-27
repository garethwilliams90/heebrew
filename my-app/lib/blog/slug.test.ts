import assert from "node:assert/strict";
import test from "node:test";
import { slugFromTitle, uniqueSlug } from "./slug";

test("builds a stable slug and keeps links unique", () => {
  assert.equal(slugFromTitle("Hello, World!"), "hello-world");
  assert.equal(slugFromTitle("שלום"), "post");
  assert.equal(uniqueSlug("hello-world", new Set(["hello-world"])), "hello-world-2");
  assert.equal(uniqueSlug("post", new Set()), "post");
});
