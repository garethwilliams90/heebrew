"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { AnswerPop, answerTone, type AnswerTone } from "@/components/learn/exercises/answer-mark";
import { ExerciseChrome } from "@/components/learn/exercises/lesson-session";
import { useAdvance } from "@/components/learn/exercises/use-advance";
import { printFont } from "@/components/alephbet/print-font";
import { HearReplayButton } from "@/components/learn/hear-replay";
import { Button } from "@/components/ui/button";
import { letterCatalog } from "@/lib/alephbet/letter-info";
import { consonantCue } from "@/lib/alephbet/intro-alphabet";
import { normalizeHebrew } from "@/lib/learn/hebrew-text";
import { letterConsonantSrc } from "@/lib/learn/consonant-sounds";
import { playCue } from "@/lib/learn/play-cue";
import { playStudyClip } from "@/lib/learn/pathway/play-study";
import type { SpellItem } from "@/lib/learn/pathway/types";
import { playAudio } from "@/lib/settings/master-volume";
import { cn } from "cn";

const byGlyph = new Map(letterCatalog.map((letter) => [letter.letter, letter]));

function bareLetter(value: string) {
  return [...value].find((char) => char >= "\u05D0" && char <= "\u05EA") ?? "";
}

function playLetter(glyph: string) {
  const letter = byGlyph.get(bareLetter(glyph));
  if (!letter) {
    return;
  }
  const src = letterConsonantSrc(letter.id);
  if (!src) {
    void playCue(consonantCue(letter));
    return;
  }
  const audio = new Audio(src);
  void playAudio(audio).catch(() => playCue(consonantCue(letter)));
}

export function SpellWord({
  items,
  onPass,
  onMiss,
}: {
  items: readonly SpellItem[];
  onPass: () => void;
  onMiss?: () => void;
}) {
  const t = useTranslations("Learn");
  const [index, setIndex] = useState(0);
  const [filled, setFilled] = useState<(number | null)[]>([]);
  const [blocked, setBlocked] = useState<number[]>([]);
  const [missed, setMissed] = useState<number[]>([]);
  const [wrongSlot, setWrongSlot] = useState<number | null>(null);
  const [tone, setTone] = useState<AnswerTone>(null);
  const advance = useAdvance(() => {
    if (index >= items.length - 1) {
      onPass();
      return;
    }
    setTone(null);
    setFilled([]);
    setBlocked([]);
    setMissed([]);
    setWrongSlot(null);
    setIndex((current) => current + 1);
  }, onMiss);
  const item = items[index];
  const target = item ? normalizeHebrew(item.prompt.hebrew) : "";

  useEffect(() => {
    if (!item) {
      return;
    }
    void playStudyClip(item.prompt);
  }, [item]);

  if (!item) {
    return null;
  }

  const places = [...target];
  const placed = filled.length === places.length ? filled : places.map(() => null);
  const used = new Set(placed.filter((slot): slot is number => slot != null));

  function choose(slot: number) {
    if (tone === "correct" || used.has(slot) || blocked.includes(slot) || missed.includes(slot)) {
      return;
    }
    const letter = item.letters[slot] ?? "";
    const place = places.findIndex((glyph, index) => glyph === letter && placed[index] == null);
    if (place < 0) {
      setWrongSlot(slot);
      setMissed((current) => [...current, slot]);
      advance.miss(() => void playStudyClip(item.prompt));
      window.setTimeout(() => setWrongSlot((current) => (current === slot ? null : current)), 700);
      return;
    }
    const next = [...placed];
    next[place] = slot;
    setFilled(next);
    if (next.every((entry) => entry != null)) {
      setTone("correct");
      advance.pass();
    }
  }

  const extras = item.letters
    .map((letter, slot) => ({ letter, slot }))
    .filter(({ letter, slot }) => !places.includes(letter) && !blocked.includes(slot) && !missed.includes(slot));

  function hint() {
    const pick = extras[Math.floor(Math.random() * extras.length)];
    if (pick) {
      setBlocked((current) => [...current, pick.slot]);
    }
  }

  return (
    <ExerciseChrome index={index} total={items.length} prompt={t("spellPrompt")} canHint={extras.length > 0} onHint={hint}>
    <div className="flex w-full max-w-xl flex-col items-center gap-5">
      <HearReplayButton onHear={() => void playStudyClip(item.prompt)}>{t("quizHear")}</HearReplayButton>
      <AnswerPop tone={tone}>
        <div
          className={cn(
            "flex min-h-16 items-end justify-center gap-5",
            tone === "correct" && "rounded-3xl border px-6 py-3",
            answerTone(tone),
          )}
          dir="rtl"
          lang="he"
        >
          {places.map((letter, place) => {
            const bankSlot = placed[place];
            const glyph = bankSlot == null ? undefined : item.letters[bankSlot];
            return (
              <span
                key={`${letter}-${place}`}
                className={cn(
                  printFont.className,
                  "flex h-16 min-w-14 items-end justify-center border-b-2 border-dotted px-1 text-5xl leading-none",
                  glyph ? "border-b-green-600! text-emerald-950" : "border-b-emerald-950/80",
                )}
              >
                {glyph ?? ""}
              </span>
            );
          })}
        </div>
      </AnswerPop>
      <div className="flex flex-wrap justify-center gap-2" dir="rtl">
        {item.letters.map((letter, slot) => {
          const rejected = wrongSlot === slot || missed.includes(slot);
          return (
          <div key={`${letter}-${slot}`} className="flex items-center gap-0.5 rounded-2xl border border-emerald-950/10 p-2">
            <AnswerPop tone={rejected ? "wrong" : null}>
            <Button
              type="button"
              sound={false}
              variant="outline"
              className={cn("size-14 rounded-2xl text-2xl", printFont.className, rejected && answerTone("wrong"))}
              lang="he"
              disabled={used.has(slot) || blocked.includes(slot) || missed.includes(slot)}
              onClick={() => choose(slot)}
            >
              {letter}
            </Button>
            </AnswerPop>
            <Button
              type="button"
              sound={false}
              variant="ghost"
              className="size-9 px-0"
              aria-label={t("hearLetter", { name: letter })}
              onClick={() => playLetter(letter)}
            >
              <Volume2 className="size-4" />
            </Button>
          </div>
          );
        })}
      </div>
    </div>
    </ExerciseChrome>
  );
}
