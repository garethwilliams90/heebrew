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
import { NikudOverview, NikudWalkCard } from "@/components/learn/pathway/nikud-walk-card";
import { GlossLabel } from "@/components/learn/gloss-label";
import { withoutNikud } from "@/lib/learn/hebrew-text";
import { glossOf } from "@/lib/learn/sentences";
import { cn } from "cn";

function SampleList({ samples }: { samples: NonNullable<IntroSlide["samples"]> }) {
  const locale = useLocale();
  const long = samples.some((sample) => withoutNikud(sample.hebrew).trim().split(/\s+/u).length >= 3);

  return (
    <ul className={cn("grid w-full gap-3", long ? "grid-cols-1" : "sm:grid-cols-2")}>
      {samples.map((sample) => (
        <li key={`${sample.hebrew}-${glossOf(sample.gloss, locale)}`} className="min-w-0">
          <Button
            type="button"
            sound={false}
            variant="outline"
            className={cn("h-auto w-full min-w-0 whitespace-normal! px-5 py-3", long && "rounded-3xl!")}
            onClick={() => void playStudyClip(sample)}
          >
            <span className="flex w-full min-w-0 flex-col items-center gap-1">
              <span className={cn(printFont.className, "text-center leading-snug", long ? "text-2xl" : "text-3xl")} dir="rtl" lang="he">
                {sample.hebrew}
              </span>
              <GlossLabel gloss={sample.gloss} className="justify-center! text-center text-sm text-emerald-800" />
            </span>
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function IntroSlideView({ slide }: { slide: IntroSlide }) {
  const locale = useLocale();
  if (slide.nikudOverview) {
    return <NikudOverview />;
  }
  if (slide.nikudId) {
    return <NikudWalkCard nikudId={slide.nikudId} />;
  }
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
        <SampleList samples={slide.samples} />
      ) : null}
    </div>
  );
}
