"use client";

import { useLocale } from "next-intl";
import { GenderMark } from "@/components/flashcards/gender-mark";
import { genderNote, stripGenderNote } from "@/lib/learn/gender-note";
import { glossOf, type LocaleGloss } from "@/lib/learn/sentences";
import { cn } from "cn";

export function GlossLabel({ gloss, className }: { gloss: LocaleGloss; className?: string }) {
  const locale = useLocale();
  const mark = genderNote(gloss);
  const text = stripGenderNote(glossOf(gloss, locale));

  return (
    <span className={cn("inline-flex flex-wrap items-center justify-end gap-1.5", className)}>
      {text ? <span>{text}</span> : null}
      {mark ? <GenderMark gender={mark.gender} number={mark.number} labeled={false} /> : null}
    </span>
  );
}
