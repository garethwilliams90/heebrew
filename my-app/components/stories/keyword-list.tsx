"use client";

import { useRef, useState } from "react";
import { BrowserCard } from "@/components/flashcards/browser-card";
import { useSoundPrefs } from "@/components/flashcards/sound-toggle";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import type { Flashcard } from "@/lib/flashcards/types";
import { playAudio } from "@/lib/settings/master-volume";
import type { WordView } from "@/lib/stories/queries";
import { exampleFromStory, inferHebrewGender, storyPartOfSpeech } from "@/lib/stories/word-facts";

export function storyFlashcards(words: WordView[], hebrew: string, gloss: string): Flashcard[] {
  return words.map((word) => {
    const example = exampleFromStory(hebrew, gloss, word.phrase);
    return {
      id: word.id,
      english: word.label,
      partOfSpeech: storyPartOfSpeech(word.phrase),
      example: example?.gloss ?? "",
      hebrew: word.phrase,
      hebrewExample: example?.hebrew ?? "",
      gender: inferHebrewGender(word.phrase),
    };
  });
}

export function KeywordList({ words, hebrew, gloss }: { words: WordView[]; hebrew: string; gloss: string }) {
  const sound = useSoundPrefs();
  const clips = useRef(new Map<string, HTMLAudioElement>());
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);

  async function play(card: Flashcard) {
    if (!sound.allows("word")) {
      return;
    }
    setFailedId(null);
    setPlayingId(card.id);
    let audio = clips.current.get(card.hebrew) ?? null;
    if (!audio) {
      audio = await loadSpeechClip(card.hebrew);
      if (audio) {
        clips.current.set(card.hebrew, audio);
      }
    }
    if (!audio) {
      setPlayingId(null);
      setFailedId(card.id);
      return;
    }
    audio.onended = () => setPlayingId((current) => (current === card.id ? null : current));
    void playAudio(audio).catch(() => {
      setPlayingId(null);
      setFailedId(card.id);
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {storyFlashcards(words, hebrew, gloss).map((card) => (
          <BrowserCard
            key={card.id}
            readOnly
            card={card}
            level={0}
            wordPlaying={playingId === card.id}
            sentencePlaying={false}
            failed={failedId === card.id}
            wordEnabled={sound.prefs.general && sound.prefs.word}
            sentenceEnabled={false}
            confirmingDelete={false}
            onPlayWord={() => void play(card)}
          />
        ))}
      </ul>
    </section>
  );
}
