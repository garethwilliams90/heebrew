"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { FlashcardSession } from "@/components/flashcards/flashcard-session";
import { MasteryMark } from "@/components/flashcards/mastery-ring";
import { StudySetup } from "@/components/flashcards/study-setup";
import { Button } from "@/components/ui/button";
import { loadDeckMastery } from "@/lib/flashcards/progress";
import type { StudyMode } from "@/lib/flashcards/study-plan";
import { DEFAULT_STUDY_COUNT } from "@/lib/flashcards/study-plan";
import { numberGloss, numberWords, numbersDeckId, toNumberCard, type NumberWord } from "@/lib/learn/numbers";
import { cn } from "cn";

type Direction = "en-he" | "he-en";
type Phase = "list" | "setup" | "study";

export function NumbersPage() {
  const t = useTranslations("Numbers");
  const locale = useLocale();
  const cards = useMemo(() => numberWords.map((word) => toNumberCard(word, locale)), [locale]);
  const [direction, setDirection] = useState<Direction>("en-he");
  const [phase, setPhase] = useState<Phase>("list");
  const [mode, setMode] = useState<StudyMode>("mix");
  const [count, setCount] = useState(DEFAULT_STUDY_COUNT);
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const digits = numberWords.filter((word) => word.group === "digit");
  const teens = numberWords.filter((word) => word.group === "teen");
  const rounds = numberWords.filter((word) => word.group === "round");

  useEffect(() => {
    if (phase !== "list") {
      return;
    }

    let current = true;
    loadDeckMastery(numbersDeckId)
      .then((loaded) => {
        if (current) {
          setMastery(loaded.mastery);
        }
      })
      .catch(() => {
        if (current) {
          setMastery({});
        }
      });

    return () => {
      current = false;
    };
  }, [phase]);

  if (phase === "study") {
    return (
      <FlashcardSession
        deckId={numbersDeckId}
        cards={cards}
        mode={mode}
        count={count}
        prompt={direction === "he-en" ? "hebrew" : "english"}
        onExit={() => setPhase("list")}
      />
    );
  }

  if (phase === "setup") {
    return (
      <StudySetup
        deckId={numbersDeckId}
        title={t("deckTitle")}
        cards={cards}
        onBack={() => setPhase("list")}
        onStart={(nextMode, nextCount) => {
          setMode(nextMode);
          setCount(nextCount);
          setPhase("study");
        }}
      />
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("title")}</h1>
      <p className="mt-2 text-emerald-900/75">{t("description")}</p>

      <section className="mt-6 rounded-3xl border border-emerald-950/10 bg-white/90 p-5">
        <h2 className="text-xl font-semibold text-emerald-950">{t("deckTitle")}</h2>
        <p className="mt-2 text-emerald-900/75">{t("deckBody")}</p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("direction")}>
          <DirectionButton
            pressed={direction === "en-he"}
            label={t("enToHe")}
            onPress={() => setDirection("en-he")}
          />
          <DirectionButton
            pressed={direction === "he-en"}
            label={t("heToEn")}
            onPress={() => setDirection("he-en")}
          />
        </div>
        <div className="mt-4">
          <Button type="button" size="lg" onClick={() => setPhase("setup")}>
            {t("practice")}
          </Button>
        </div>
      </section>

      <NumberGrid title={t("digits")} words={digits} mastery={mastery} />

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-emerald-950">{t("larger")}</h2>
        <NumberGrid title={t("teens")} words={teens} mastery={mastery} nested />
        <NumberGrid title={t("rounds")} words={rounds} mastery={mastery} nested />
      </section>
    </main>
  );
}

function DirectionButton({
  pressed,
  label,
  onPress,
}: {
  pressed: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm",
        pressed
          ? "border-emerald-700 bg-emerald-700 text-white"
          : "border-emerald-950/15 bg-white text-emerald-950 hover:bg-emerald-50",
      )}
      onClick={onPress}
    >
      {label}
    </button>
  );
}

function NumberGrid({
  title,
  words,
  mastery,
  nested = false,
}: {
  title: string;
  words: readonly NumberWord[];
  mastery: Record<string, number>;
  nested?: boolean;
}) {
  const locale = useLocale();

  return (
    <section className={nested ? "mt-6" : "mt-10"}>
      <h3 className={nested ? "text-base font-semibold text-emerald-950" : "text-xl font-semibold text-emerald-950"}>
        {title}
      </h3>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {words.map((word) => (
          <li key={word.id} className="relative rounded-2xl border border-emerald-950/10 bg-white/90 p-4">
            <NumberMastery level={mastery[word.id] ?? 0} />
            <p className="text-sm tabular-nums text-emerald-800/70">{word.value}</p>
            <p dir="rtl" lang="he" className={cn("mt-1 text-3xl leading-none text-emerald-950", printFont.className)}>
              {word.hebrew}
            </p>
            <p className="mt-3 text-base text-emerald-950">{numberGloss(word, locale)}</p>
            <p className="text-sm text-emerald-800/70">{word.transliteration}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NumberMastery({ level }: { level: number }) {
  const t = useTranslations("Flashcards");
  const stage = Math.min(6, Math.max(0, Math.round(level)));
  const label = stage >= 6 ? t("mastered") : stage === 0 ? t("statusNew") : t("mastery", { level: stage });

  return (
    <span role="img" aria-label={label} className="absolute top-2 end-2">
      <MasteryMark level={level} size="xs" />
    </span>
  );
}
