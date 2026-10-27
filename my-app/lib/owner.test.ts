import assert from "node:assert/strict";
import test from "node:test";
import { isOwnerUser } from "./owner";

test("only a confirmed matching email is the owner", () => {
  const owner = { email: "Owner@Example.com", email_confirmed_at: "2026-01-01T00:00:00Z" };
  assert.equal(isOwnerUser(owner, "owner@example.com"), true);
  assert.equal(isOwnerUser(owner, "someone@example.com"), false);
  assert.equal(isOwnerUser({ ...owner, email_confirmed_at: null }, "owner@example.com"), false);
  assert.equal(isOwnerUser(owner, ""), false);
  assert.equal(isOwnerUser(null, "owner@example.com"), false);
});
