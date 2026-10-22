"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { printFont } from "@/components/alephbet/print-font";
import { Button } from "@/components/ui/button";
import type { HearCard } from "@/lib/learn/sentences";
import { cn } from "cn";

export function HebrewMark({ children }: { children: ReactNode }) {
  return (
    <span className={cn(printFont.className, "text-[1.15em] text-black")} dir="rtl" lang="he">
      {children}
    </span>
  );
}

export function HearCards({
  cards,
  onHear,
}: {
  cards: readonly HearCard[];
  onHear: (text: string) => void;
}) {
  const t = useTranslations("Learn");

  return (
    <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <li key={card.id} className="flex flex-col items-center gap-2 rounded-3xl bg-white/80 px-4 py-3 shadow-sm">
          <span className={cn(printFont.className, "text-4xl text-black")} dir="rtl" lang="he">
            {card.hebrew}
          </span>
          <span className="text-sm text-emerald-900/80">{t(card.label)}</span>
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
            onClick={() => onHear(card.example ?? card.hebrew)}
          >
            <Volume2 /> {t("letterIntroHear")}
          </Button>
        </li>
      ))}
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
