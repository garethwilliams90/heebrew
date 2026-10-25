"use client";

import { useLocale } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { LetterIntro } from "@/components/learn/letter-intro";
import { Button } from "@/components/ui/button";
import { letterById } from "@/lib/alephbet/letter-lookup";
import type { LetterFact } from "@/lib/alephbet/letter-info";
import { playCue } from "@/lib/learn/play-cue";
import { playStudyClip } from "@/lib/learn/pathway/play-study";
import type { IntroSlide } from "@/lib/learn/pathway/types";
import { GlossLabel } from "@/components/learn/gloss-label";
import { glossOf } from "@/lib/learn/sentences";
import { cn } from "cn";

export function IntroSlideView({ slide }: { slide: IntroSlide }) {
  const locale = useLocale();
  const letters = (slide.samples ?? []).flatMap((sample) => {
    const letter = sample.letterId ? letterById.get(sample.letterId) : undefined;
    return letter ? [letter] : [];
  });
  if (slide.samples && slide.samples.length > 0 && letters.length === slide.samples.length) {
    return <LetterIntro letters={letters as LetterFact[]} onPlay={(cue) => void playCue(cue)} />;
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{glossOf(slide.title, locale)}</h1>
      <p className="max-w-2xl text-lg text-emerald-900">{glossOf(slide.body, locale)}</p>
      {slide.samples && slide.samples.length > 0 ? (
        <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {slide.samples.map((sample) => (
            <li key={`${sample.hebrew}-${glossOf(sample.gloss, locale)}`}>
              <Button
                type="button"
                sound={false}
                variant="outline"
                className="h-auto w-full justify-between px-4 py-3"
                onClick={() => void playStudyClip(sample)}
              >
                <span className={cn(printFont.className, "text-3xl")} dir="rtl" lang="he">
                  {sample.hebrew}
                </span>
                <GlossLabel gloss={sample.gloss} className="text-sm text-emerald-800" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
