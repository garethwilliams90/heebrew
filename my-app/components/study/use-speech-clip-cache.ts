"use client";

import { useRef } from "react";
import { prepareSpeechClip, requestDeckSpeech } from "@/lib/flashcards/deck-speech";

export function useSpeechClipCache() {
  const clips = useRef(new Map<string, HTMLAudioElement>());
  const clipUrls = useRef<string[]>([]);

  function stopClips() {
    for (const clip of clips.current.values()) {
      clip.onended = null;
      clip.pause();
      clip.currentTime = 0;
    }
  }

  function disposeClips() {
    stopClips();
    for (const url of clipUrls.current) {
      URL.revokeObjectURL(url);
    }
    clipUrls.current = [];
    clips.current.clear();
  }

  async function loadSpeechTexts(texts: string[], isCancelled?: () => boolean) {
    const missing = [...new Set(texts)].filter((text) => text.length > 0 && !clips.current.has(text));
    if (missing.length === 0) {
      return;
    }

    const clipsForDeck = await requestDeckSpeech(missing);
    if (isCancelled?.()) {
      return;
    }

    await Promise.all(
      clipsForDeck.map(async (clip) => {
        if (clips.current.has(clip.text)) {
          return;
        }

        const { url, audio } = await prepareSpeechClip(clip.audio);
        if (isCancelled?.()) {
          URL.revokeObjectURL(url);
          return;
        }

        clipUrls.current.push(url);
        clips.current.set(clip.text, audio);
      }),
    );
  }

  return { clips, stopClips, disposeClips, loadSpeechTexts };
}
