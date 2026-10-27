"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { HebrewGlyph } from "@/components/learn/hebrew-glyph";
import { HearTile } from "@/components/learn/hear-tile";
import { Button } from "@/components/ui/button";
import { consonantCue, type SpeechCue } from "@/lib/alephbet/intro-alphabet";
import { letterCatalog, type LetterFact } from "@/lib/alephbet/letter-info";
import { consonantForms, consonantSrc, letterConsonantSrc, type ConsonantForm } from "@/lib/learn/consonant-sounds";
import { playAudio } from "@/lib/settings/master-volume";
import { cn } from "cn";

const alphabet = letterCatalog.filter((item) => item.kind === "letter");

export function LetterIntro({
  letters,
  onPlay,
}: {
  letters: readonly LetterFact[];
  onPlay: (cue: SpeechCue) => void;
}) {
  const t = useTranslations("Learn");
  const focus = new Set(letters.map((item) => item.id));
  const places = letters.map((item) => item.alphabet);
  const numbered = places.every((place) => place != null);
  const clips = useRef(new Map<string, HTMLAudioElement>());
  const current = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    for (const letter of letters) {
      const src = letterConsonantSrc(letter.id);
      if (!src || clips.current.has(src)) {
        continue;
      }
      const audio = new Audio(src);
      audio.preload = "auto";
      clips.current.set(src, audio);
    }
  }, [letters]);

  // The recorded clips sound cleaner than synthesized speech, which is only a fallback.
  function hearSrc(src: string, letter: LetterFact) {
    current.current?.pause();
    let audio = clips.current.get(src);
    if (!audio) {
      audio = new Audio(src);
      clips.current.set(src, audio);
    }
    current.current = audio;
    void playAudio(audio).catch(() => onPlay(consonantCue(letter)));
  }

  function hearConsonant(letter: LetterFact) {
    const src = letterConsonantSrc(letter.id);
    if (!src) {
      onPlay(consonantCue(letter));
      return;
    }
    hearSrc(src, letter);
  }

  const five = letters.length === 5;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center gap-5 self-center overflow-y-auto px-2 py-2 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">
          {t("letterIntroTitle", { count: letters.length })}
        </h1>
        <p className="mt-2 text-base text-emerald-900/75">
          {numbered
            ? t("letterIntroPlace", {
                count: letters.length,
                first: places[0] ?? 0,
                last: places[places.length - 1] ?? 0,
                total: alphabet.length,
              })
            : t("letterIntroFinal")}
        </p>
      </div>

      <div className={cn("grid w-full justify-center gap-4", five ? "sm:grid-cols-6" : letters.length > 1 ? "max-w-3xl sm:grid-cols-2" : "max-w-md")}>
        {letters.map((letter, index) => {
          const forms = consonantForms(letter.id);
          return (
            <HearTile
              key={letter.id}
              className={cn("h-full w-full px-5 py-4", five && "sm:col-span-2", five && index === 3 && "sm:col-start-2")}
              hearLabel={forms ? undefined : t("letterIntroHear")}
              hearAriaLabel={forms ? undefined : t("hearLetter", { name: letter.name })}
              onHear={forms ? undefined : () => hearConsonant(letter)}
            >
              {forms ? (
                <div className="flex flex-wrap items-start justify-center gap-6">
                  {forms.map((form) => (
                    <LetterForm
                      key={form.glyph}
                      form={form}
                      letter={letter}
                      onHear={() => {
                        if (form.file) {
                          hearSrc(consonantSrc(form.file), letter);
                          return;
                        }
                        onPlay({ text: form.glyph, phoneme: form.sound });
                      }}
                    />
                  ))}
                </div>
              ) : (
                <HebrewGlyph className="text-7xl leading-none sm:text-8xl">{letter.letter}</HebrewGlyph>
              )}
              <h2 className="text-2xl font-semibold text-emerald-950">{letter.name}</h2>
              {forms ? null : (
                <p className="text-base font-medium text-emerald-900">{t("letterIntroSound", { sound: letter.sound })}</p>
              )}
              <p className="max-w-xs text-sm text-emerald-900/75">{t(`letterNotes.${letter.id}`)}</p>
            </HearTile>
          );
        })}
      </div>

      <HebrewGlyph className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-3xl leading-tight sm:text-4xl" aria-label={t("letterIntroAlphabet")}>
        {alphabet.map((item) => (
          <span key={item.id} className={focus.has(item.id) ? "font-bold text-blue-600" : "font-normal text-emerald-950/45"}>
            {item.letter}
          </span>
        ))}
      </HebrewGlyph>
    </div>
  );
}

function LetterForm({
  form,
  letter,
  onHear,
}: {
  form: ConsonantForm;
  letter: LetterFact;
  onHear: () => void;
}) {
  const t = useTranslations("Learn");

  return (
    <div className="flex flex-col items-center gap-2">
      <HebrewGlyph className="text-6xl leading-none sm:text-7xl">{form.glyph}</HebrewGlyph>
      <p className="text-base font-medium text-emerald-900">{t("letterIntroSound", { sound: form.sound })}</p>
      <Button
        type="button"
        variant="outline"
        className="h-10 px-4"
        aria-label={t("hearLetter", { name: `${letter.name} ${form.sound}` })}
        sound={false}
        onClick={onHear}
      >
        <Volume2 /> {t("letterIntroHear")}
      </Button>
    </div>
  );
}
