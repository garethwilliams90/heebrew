import assert from "node:assert/strict";
import test from "node:test";
import { isStoryAudioPath, validateStoryAudio } from "./audio";

const mp3 = new Uint8Array([0x49, 0x44, 0x33, 0x04, 0x00]);
const wav = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
]);

test("accepts an mp3 recording and rejects a mismatched type", () => {
  const ok = validateStoryAudio({ bytes: mp3, mime: "audio/mpeg", name: "story.mp3" });
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.ext, "mp3");
  }

  const wrong = validateStoryAudio({ bytes: mp3, mime: "audio/wav", name: "story.wav" });
  assert.deepEqual(wrong, { ok: false, reason: "type" });
});

test("rejects empty and oversized recordings", () => {
  assert.deepEqual(validateStoryAudio({ bytes: new Uint8Array(), mime: "audio/mpeg", name: "story.mp3" }), {
    ok: false,
    reason: "empty",
  });
  const huge = new Uint8Array(20 * 1024 * 1024 + 1);
  huge.set(mp3);
  assert.equal(validateStoryAudio({ bytes: huge, mime: "audio/mpeg", name: "story.mp3" }).ok, false);
});

test("accepts a wav and only server-shaped audio paths", () => {
  const ok = validateStoryAudio({ bytes: wav, mime: "audio/wav", name: "story.wav" });
  assert.equal(ok.ok, true);
  assert.equal(isStoryAudioPath("123e4567-e89b-12d3-a456-426614174000.wav"), true);
  assert.equal(isStoryAudioPath("../secret.mp3"), false);
  assert.equal(isStoryAudioPath("123e4567-e89b-12d3-a456-426614174000.mp3/../x"), false);
});
