import assert from "node:assert/strict";
import test from "node:test";
import { detectedMediaExt, validateContentMedia } from "./media";

test("accepts a gif and rejects a mismatched name", () => {
  const gif = Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0]);
  assert.equal(detectedMediaExt(gif), "gif");
  assert.equal(validateContentMedia({ bytes: gif, mime: "image/gif", name: "wave.gif" }).ok, true);
  assert.equal(validateContentMedia({ bytes: gif, mime: "image/png", name: "wave.gif" }).ok, false);
});

test("rejects an empty upload and a video that is too large", () => {
  assert.equal(validateContentMedia({ bytes: new Uint8Array(), mime: "image/png", name: "a.png" }).ok, false);
  const mp4 = new Uint8Array(18 * 1024 * 1024 + 1);
  mp4.set([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70], 0);
  const checked = validateContentMedia({ bytes: mp4, mime: "video/mp4", name: "clip.mp4" });
  assert.equal(checked.ok, false);
  if (!checked.ok) {
    assert.equal(checked.reason, "size");
  }
});
