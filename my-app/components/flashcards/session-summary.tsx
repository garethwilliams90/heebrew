"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { ExperienceAward } from "@/components/flashcards/experience-award";
import { MasteryMark } from "@/components/flashcards/mastery-ring";
import { LeafHeroScreen } from "@/components/leaf-hero-screen";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { PartOfSpeech } from "@/lib/flashcards/types";

export type SessionCardResult = {
  id: string;
  english: string;
  hebrew: string;
  partOfSpeech: PartOfSpeech;
  from: number;
  to: number;
  missed: boolean;
};

const listSpring = { type: "spring" as const, bounce: 0.18, visualDuration: 0.35 };

export function SessionSummary({
  title,
  body,
  cards,
  reward,
  saving,
  deckId,
  onStudyAgain,
}: {
  title: string;
  body: string;
  cards: SessionCardResult[];
  reward: { from: number; to: number } | null;
  saving: boolean;
  deckId: string;
  onStudyAgain: () => void;
}) {
  const t = useTranslations("Flashcards");
  const missed = cards.filter((card) => card.missed);
  const known = cards.filter((card) => !card.missed);

  return (
    <LeafHeroScreen
      className="flex w-full max-w-2xl flex-1 flex-col items-center px-1 py-6 text-center"
      title={title}
      body={body}
      actions={
        <>
          <Button type="button" size="lg" disabled={saving} onClick={onStudyAgain}>
            {t("studyAgain")}
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/decks?deck=${deckId}&view=cards`}>{t("backToDeck")}</Link>
          </Button>
        </>
      }
    >
      {reward ? <ExperienceAward from={reward.from} to={reward.to} /> : null}
      {cards.length > 0 ? (
        <div className="mt-8 w-full text-left">
          <CardGroup
            label={missed.length > 0 ? t("needsWork") : null}
            cards={missed}
            tone="missed"
            startIndex={0}
          />
          <CardGroup
            label={missed.length > 0 && known.length > 0 ? t("studiedCards") : null}
            cards={known}
            tone="known"
            startIndex={missed.length}
          />
        </div>
      ) : null}
    </LeafHeroScreen>
  );
}

function CardGroup({
  label,
  cards,
  tone,
  startIndex,
}: {
  label: string | null;
  cards: SessionCardResult[];
  tone: "missed" | "known";
  startIndex: number;
}) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className={startIndex > 0 ? "mt-6" : ""}>
      {label ? <h2 className="text-sm font-medium text-emerald-900/70">{label}</h2> : null}
      <ul className="mt-3 flex flex-col gap-3">
        {cards.map((card, index) => (
          <SummaryCard key={card.id} card={card} tone={tone} index={startIndex + index} />
        ))}
      </ul>
    </div>
  );
}

function SummaryCard({
  card,
  tone,
  index,
}: {
  card: SessionCardResult;
  tone: "missed" | "known";
  index: number;
}) {
  const t = useTranslations("Flashcards");

  return (
    <motion.li
      className={`flex items-center justify-between gap-4 rounded-3xl border px-4 py-4 ${
        tone === "missed" ? "border-orange-200 bg-orange-50" : "border-emerald-950/10 bg-white/90"
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...listSpring, delay: Math.min(index, 12) * 0.04 }}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-[0.14em] text-emerald-800/70 uppercase">
          {t(`pos.${card.partOfSpeech}`)}
        </p>
        <p className="mt-1 text-lg font-semibold tracking-tight">{card.english}</p>
        <p dir="rtl" lang="he" className="mt-1 text-xl font-semibold">
          {card.hebrew}
        </p>
      </div>
      <RisingMastery from={card.from} to={card.to} delay={280 + Math.min(index, 12) * 80} />
    </motion.li>
  );
}

function RisingMastery({ from, to, delay }: { from: number; to: number; delay: number }) {
  const t = useTranslations("Flashcards");
  const [level, setLevel] = useState(from);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || from === to) {
      setLevel(to);
      return;
    }

    const timers: number[] = [];
    const step = to > from ? 1 : -1;
    let current = from;
    let wait = delay;

    while (current !== to) {
      current += step;
      const next = current;
      timers.push(window.setTimeout(() => setLevel(next), wait));
      wait += 180;
    }

    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [delay, from, to]);

  return (
    <motion.span
      key={level}
      role="img"
      aria-label={t("mastery", { level })}
      className="inline-flex shrink-0"
      initial={{ scale: from === level ? 1 : 0.86 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", bounce: 0.28, visualDuration: 0.28 }}
    >
      <MasteryMark level={level} />
    </motion.span>
  );
}
