"use client";

import { useEffect, useState } from "react";
import type { SpeechCue } from "@/lib/alephbet/intro-alphabet";
import { basicWords, type BasicWord } from "@/lib/learn/basic-words";
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
  const [rounds] = useState(() => wordRounds(words, basicWords));

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

function wordRounds(targets: readonly BasicWord[], pool: readonly BasicWord[]): QuizRound[] {
  return targets.map((word) => {
    const others = shuffleLetters(pool.filter((item) => item.id !== word.id)).slice(0, 2);
    const choices = shuffleLetters([word, ...others]).map((item) => ({
      id: item.id,
      name: item.english,
      cue: { text: item.hebrew },
      glyph: item.hebrew,
    }));

    return {
      id: word.id,
      correctId: word.id,
      prompt: { text: word.hebrew },
      choices,
    };
  });
}
