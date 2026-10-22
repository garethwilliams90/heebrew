"use client";

import { useEffect, useRef } from "react";
import { printFont } from "@/components/alephbet/print-font";
import { cn } from "cn";

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

  useEffect(() => {
    // Play boop sound when sentence appears
    const audio = new Audio("/sounds/samples/boop.mp3");
    audio.volume = 0.3;
    audioRef.current = audio;
    
    const playBoop = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Autoplay can fail, that's ok
      });
    };
    
    playBoop();
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [template]);

  return (
    <p dir="rtl" lang="he" className={cn(printFont.className, "text-3xl leading-loose text-black sm:text-4xl")}>
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
