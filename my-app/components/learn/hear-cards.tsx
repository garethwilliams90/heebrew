"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { printFont } from "@/components/alephbet/print-font";
import { GenderMark } from "@/components/flashcards/gender-mark";
import { Button } from "@/components/ui/button";
import { glossOf, type HearCard, type HearLabel } from "@/lib/learn/sentences";
import type { GrammaticalGender } from "@/lib/flashcards/types";
import { cn } from "cn";

const formMarks: Partial<Record<HearLabel, { gender: GrammaticalGender; number: "singular" | "plural" }>> = {
  formMs: { gender: "masculine", number: "singular" },
  formFs: { gender: "feminine", number: "singular" },
  formMp: { gender: "masculine", number: "plural" },
  formFp: { gender: "feminine", number: "plural" },
};

export function HebrewMark({ children, tone = "ink" }: { children: ReactNode; tone?: "ink" | "new" }) {
  return (
    <span
      className={cn(printFont.className, "text-[1.15em]", tone === "new" ? "text-blue-600" : "text-black")}
      dir="rtl"
      lang="he"
    >
      {children}
    </span>
  );
}

export function HearCards({
  cards,
  onHear,
}: {
  cards: readonly HearCard[];
  onHear: (text: string, audio?: string) => void;
}) {
  const t = useTranslations("Learn");
  const locale = useLocale();

  return (
    <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
      {cards.map((card) => {
        const form = card.label ? formMarks[card.label] : undefined;
        return (
        <li key={card.id} className="flex flex-col items-center gap-2 rounded-3xl bg-white/80 px-4 py-3 shadow-sm">
          <span className={cn(printFont.className, "text-4xl text-black")} dir="rtl" lang="he">
            {card.hebrew}
          </span>
          {form ? (
            <>
              <GenderMark gender={form.gender} number={form.number} labeled={false} />
              <span className="sr-only">{card.label ? t(card.label) : ""}</span>
            </>
          ) : (
            <span className="text-sm text-emerald-900/80">{card.caption ? glossOf(card.caption, locale) : card.label ? t(card.label) : ""}</span>
          )}
          {card.example ? (
            <span className={cn(printFont.className, "text-lg text-emerald-950")} dir="rtl" lang="he">
              {card.example}
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4"
            sound={false}
            onClick={() => onHear(card.audio ? card.hebrew : (card.example ?? card.hebrew), card.audio)}
          >
            <Volume2 /> {t("letterIntroHear")}
          </Button>
        </li>
        );
      })}
    </ul>
  );
}

export function ConceptSlide({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 w-full max-w-xl flex-col items-center gap-4 overflow-y-auto px-2 py-2 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">{title}</h1>
      {children}
    </div>
  );
}
