"use client";

import { useEffect, useState } from "react";
import type { SpeechCue } from "@/lib/alephbet/intro-alphabet";
import type { BasicWord } from "@/lib/learn/basic-words";
import { rememberKnownWord } from "@/lib/learn/known-words";
import { shuffleLetters } from "@/lib/alephbet/letters";
import { SoundQuiz, type QuizRound } from "@/components/learn/letter-quiz";

export function WordQuiz({
  words,
  onPlay,
  onPass,
  learn,
}: {
  words: readonly BasicWord[];
  onPlay: (cue: SpeechCue) => void | Promise<void>;
  onPass: () => void;
  learn?: boolean;
}) {
  const [rounds] = useState(() => wordRounds(words));

  useEffect(() => {
    if (!learn) {
      return;
    }

    for (const word of words) {
      void rememberKnownWord(word);
    }
  }, [learn, words]);

  return (
    <SoundQuiz
      rounds={rounds}
      onPlay={onPlay}
      onPass={onPass}
      onLearn={
        learn
          ? (card) => {
              const word = words.find((item) => item.id === card.id);
              if (word) {
                void rememberKnownWord(word);
              }
            }
          : undefined
      }
    />
  );
}

const vowelMarks = ["\u05B7", "\u05B5", "\u05B4", "\u05B9", "\u05B6", "\u05BB"];
const swappableVowels = new Set([...vowelMarks, "\u05B8", "\u05B0"]);

function withVowel(hebrew: string, vowel: string) {
  let swapped = false;
  let seenLetter = false;
  let next = "";

  for (const char of hebrew) {
    const code = char.codePointAt(0) ?? 0;
    const mark = code >= 0x0591 && code <= 0x05c7;
    if (!mark) {
      seenLetter = true;
      next += char;
      continue;
    }
    if (!swapped && seenLetter && swappableVowels.has(char)) {
      next += vowel;
      swapped = true;
      continue;
    }
    if (swappableVowels.has(char)) {
      continue;
    }
    next += char;
  }

  return next;
}

function wordRounds(targets: readonly BasicWord[]): QuizRound[] {
  return targets.map((word) => {
    const glyphs = [word.hebrew];
    for (const vowel of shuffleLetters(vowelMarks)) {
      const variant = withVowel(word.hebrew, vowel);
      if (!glyphs.includes(variant)) {
        glyphs.push(variant);
      }
      if (glyphs.length === 3) {
        break;
      }
    }

    const choices = shuffleLetters(glyphs).map((glyph) => ({
      id: glyph === word.hebrew ? word.id : glyph,
      name: word.english,
      cue: { text: glyph },
      glyph,
    }));

    return {
      id: word.id,
      correctId: word.id,
      prompt: { text: word.hebrew },
      choices,
    };
  });
}
