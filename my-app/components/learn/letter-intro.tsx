"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { printFont } from "@/components/alephbet/print-font";
import { Button } from "@/components/ui/button";
import { consonantCue, type SpeechCue } from "@/lib/alephbet/intro-alphabet";
import { letterCatalog, type LetterFact } from "@/lib/alephbet/letter-info";
import { letterConsonantSrc } from "@/lib/learn/consonant-sounds";
import { playAudio } from "@/lib/settings/master-volume";
import { cn } from "cn";

const alphabet = letterCatalog.filter((item) => item.kind === "letter");

export function LetterIntro({
  letters,
  onPlay,
  onNext,
}: {
  letters: readonly LetterFact[];
  onPlay: (cue: SpeechCue) => void;
  onNext: () => void;
}) {
  const t = useTranslations("Learn");
  const focus = new Set(letters.map((item) => item.id));
  const places = letters.map((item) => item.alphabet ?? 0);
  const clipRef = useRef<HTMLAudioElement | null>(null);

  // The recorded clips sound cleaner than synthesized speech, which is only a fallback.
  function hearConsonant(letter: LetterFact) {
    const src = letterConsonantSrc(letter.id);
    if (!src) {
      onPlay(consonantCue(letter));
      return;
    }
    clipRef.current?.pause();
    const audio = new Audio(src);
    clipRef.current = audio;
    void playAudio(audio).catch(() => onPlay(consonantCue(letter)));
  }

  return (
    <div className="flex max-h-full w-full max-w-4xl flex-col items-center gap-5 overflow-y-auto px-2 py-2 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">
          {t("letterIntroTitle", { count: letters.length })}
        </h1>
        <p className="mt-2 text-base text-emerald-900/75">
          {t("letterIntroPlace", {
            count: letters.length,
            first: places[0] ?? 0,
            last: places[places.length - 1] ?? 0,
            total: alphabet.length,
          })}
        </p>
      </div>

      <div className={cn("grid w-full gap-4", letters.length > 1 ? "sm:grid-cols-2" : "max-w-md")}>
        {letters.map((letter) => (
          <section key={letter.id} className="flex flex-col items-center gap-2 rounded-3xl bg-white/80 px-5 py-4 shadow-sm">
            <p className={cn(printFont.className, "text-7xl leading-none text-black sm:text-8xl")} dir="rtl" lang="he">
              {letter.letter}
            </p>
            <h2 className="text-2xl font-semibold text-emerald-950">{letter.name}</h2>
            <p className="text-base font-medium text-emerald-900">{t("letterIntroSound", { sound: letter.sound })}</p>
            <p className="max-w-xs text-sm text-emerald-900/75">{t(`letterNotes.${letter.id}`)}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-1 h-10 px-4"
              aria-label={t("hearLetter", { name: letter.name })}
              sound={false}
              onClick={() => hearConsonant(letter)}
            >
              <Volume2 /> {t("letterIntroHear")}
            </Button>
          </section>
        ))}
      </div>

      <p
        className={cn(printFont.className, "flex flex-wrap justify-center gap-x-2 gap-y-1 text-3xl leading-tight sm:text-4xl")}
        dir="rtl"
        lang="he"
        aria-label={t("letterIntroAlphabet")}
      >
        {alphabet.map((item) => (
          <span key={item.id} className={focus.has(item.id) ? "font-bold text-blue-600" : "font-normal text-emerald-950/45"}>
            {item.letter}
          </span>
        ))}
      </p>

      <Button type="button" className="h-11 shrink-0 bg-emerald-800 px-5 text-white hover:bg-emerald-900" onClick={onNext}>
        {t("next")}
      </Button>
    </div>
  );
}
