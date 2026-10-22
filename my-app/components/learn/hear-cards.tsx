import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { HebrewGlyph } from "@/components/learn/hebrew-glyph";
import { HearTile } from "@/components/learn/hear-tile";
import type { HearCard } from "@/lib/learn/sentences";

export function HebrewMark({ children }: { children: ReactNode }) {
  return <HebrewGlyph className="text-[1.15em]">{children}</HebrewGlyph>;
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
        <li key={card.id}>
          <HearTile hearLabel={t("letterIntroHear")} onHear={() => onHear(card.example ?? card.hebrew)}>
            <HebrewGlyph className="text-4xl">{card.hebrew}</HebrewGlyph>
            <span className="text-sm text-emerald-900/80">{t(card.label)}</span>
            {card.example ? <HebrewGlyph className="text-lg text-emerald-950">{card.example}</HebrewGlyph> : null}
          </HearTile>
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
