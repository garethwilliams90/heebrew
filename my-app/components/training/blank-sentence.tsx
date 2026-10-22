"use client";

import { useEffect, useRef } from "react";
import { printFont } from "@/components/alephbet/print-font";
import { cn } from "cn";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";

export function BlankSentence({
  template,
  blankLabel,
  onBlankClick,
}: {
  template: string;
  blankLabel: string;
  onBlankClick?: () => void;
}) {
  const parts = template.split("{}");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sequenceRef = useRef<number>(0);

  useEffect(() => {
    const currentSequence = sequenceRef.current + 1;
    sequenceRef.current = currentSequence;

    const playSequencedAudio = async () => {
      // If sentence has no blank, just play it normally
      if (parts.length === 1) {
        const audio = await loadSpeechClip(parts[0]);
        if (currentSequence !== sequenceRef.current || !audio) return;
        audio.play().catch(() => {});
        return;
      }

      // Play first part
      if (parts[0] && parts[0].trim()) {
        const audio1 = await loadSpeechClip(parts[0]);
        if (currentSequence !== sequenceRef.current || !audio1) return;
        
        await new Promise<void>((resolve) => {
          audio1.onended = () => resolve();
          audio1.onerror = () => resolve();
          audio1.play().catch(() => resolve());
        });
      }

      // Play boop sound
      if (currentSequence !== sequenceRef.current) return;
      const boopAudio = new Audio("/sounds/samples/boop.mp3");
      boopAudio.volume = 0.3;
      
      await new Promise<void>((resolve) => {
        boopAudio.onended = () => resolve();
        boopAudio.onerror = () => resolve();
        boopAudio.play().catch(() => resolve());
      });

      // Play second part (if exists)
      if (currentSequence !== sequenceRef.current) return;
      if (parts[1] && parts[1].trim()) {
        const audio2 = await loadSpeechClip(parts[1]);
        if (currentSequence !== sequenceRef.current || !audio2) return;
        audio2.play().catch(() => {});
      }
    };

    void playSequencedAudio();

    return () => {
      sequenceRef.current += 1;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [template, parts]);

  return (
    <p dir="rtl" lang="he" className={cn(printFont.className, "text-center text-3xl leading-loose text-black sm:text-4xl")}>
      {parts.map((part, partIndex) => (
        <span key={`${partIndex}-${part}`}>
          {part}
          {partIndex < parts.length - 1 ? (
            <button
              type="button"
              className="mx-1 inline-block min-w-16 border-b-2 border-emerald-900 align-middle transition-colors hover:border-emerald-700 hover:bg-emerald-50"
              onClick={onBlankClick}
              disabled={!onBlankClick}
            >
              <span className="sr-only">{blankLabel}</span>
            </button>
          ) : null}
        </span>
      ))}
    </p>
  );
}
