"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Link, useRouter } from "@/i18n/navigation";
import { prefetchStudyAudio } from "@/lib/flashcards/deck-speech";
import { loadExperience } from "@/lib/flashcards/experience";
import { loadDeckMemory } from "@/lib/flashcards/progress";
import type { CardMemory } from "@/lib/flashcards/schedule";
import {
  countPools,
  DEFAULT_STUDY_COUNT,
  MAX_STUDY_COUNT,
  type StudyMode,
} from "@/lib/flashcards/study-plan";
import type { Flashcard } from "@/lib/flashcards/types";

const modes: StudyMode[] = ["new", "review", "mix", "trial"];

export function StudySetup({
  deckId,
  title,
  cards,
}: {
  deckId: string;
  title: string;
  cards: Flashcard[];
}) {
  const t = useTranslations("Flashcards");
  const router = useRouter();
  const [mode, setMode] = useState<StudyMode>("mix");
  const [count, setCount] = useState(DEFAULT_STUDY_COUNT);
  const [memories, setMemories] = useState<Record<string, CardMemory>>({});
  const pools = countPools(cards, memories);
  const available = cardsForMode(mode, pools.fresh, pools.current);
  const trial = mode === "trial";
  const countLimit = Math.min(MAX_STUDY_COUNT, Math.max(cards.length, 1));

  useEffect(() => {
    let cancelled = false;

    loadDeckMemory(deckId)
      .then(({ memory }) => {
        if (!cancelled) {
          setMemories(memory);
        }
      })
      .catch(() => {
        // Counts stay at the unsigned estimate when progress cannot be read.
      });
    void loadExperience().catch(() => {
      // The session reads experience again if this request fails.
    });
    prefetchStudyAudio(cards);

    return () => {
      cancelled = true;
    };
  }, [cards, deckId]);

  function start() {
    const nextCount = Math.min(countLimit, Math.max(1, Math.round(count) || DEFAULT_STUDY_COUNT));
    router.push(`/decks?deck=${deckId}&view=study&mode=${mode}&count=${nextCount}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">{t("setupTitle")}</h1>
      <p className="mt-2 text-emerald-950/70">{title}</p>
      <p className="mt-1 text-sm text-emerald-900/70">{t("setupBody")}</p>

      <section className={`mt-8 ${trial ? "opacity-50" : ""}`}>
        <h2 id="card-amount" className="text-lg font-semibold">
          {t("cardAmount")}
        </h2>
        <div className="mt-4 flex items-center gap-4">
          <Slider
            min={1}
            max={countLimit}
            step={1}
            value={[Math.min(count, countLimit)]}
            disabled={trial}
            aria-labelledby="card-amount"
            onValueChange={(value) => {
              const next = value[0];
              if (typeof next === "number") {
                setCount(next);
              }
            }}
          />
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={countLimit}
            value={Math.min(count, countLimit)}
            disabled={trial}
            aria-labelledby="card-amount"
            className="h-11 w-20 border-emerald-900/10 bg-white text-center"
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isInteger(next)) {
                setCount(Math.min(countLimit, Math.max(1, next)));
              }
            }}
          />
        </div>
        {trial ? <p className="mt-2 text-sm text-emerald-900/70">{t("trialLength")}</p> : null}
      </section>

      <fieldset className="mt-8">
        <legend className="text-lg font-semibold">{t("whatToStudy")}</legend>
        <div className="mt-3 grid gap-3">
          {modes.map((option) => {
            const optionCount = cardsForMode(option, pools.fresh, pools.current);
            const disabled = optionCount === 0;
            const selected = mode === option;

            return (
              <label
                key={option}
                className={`rounded-3xl border px-4 py-4 ${
                  disabled
                    ? "cursor-not-allowed border-emerald-950/10 bg-white/50 opacity-60"
                    : selected
                      ? "cursor-pointer border-emerald-700 bg-white shadow-[0_16px_40px_-28px_rgba(6,78,59,0.6)]"
                      : "cursor-pointer border-emerald-950/10 bg-white/80"
                }`}
              >
                <input
                  type="radio"
                  name="study-mode"
                  className="sr-only"
                  value={option}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => setMode(option)}
                />
                <span className="block font-medium">{t(modeCopy[option].title)}</span>
                <span className="mt-1 block text-sm text-emerald-900/70">{t(modeCopy[option].hint)}</span>
                <span className="mt-2 block text-sm text-emerald-800">
                  {t("availableCount", { count: optionCount })}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {available === 0 ? (
        <p className="mt-6 text-sm text-emerald-900/70">{t("noCardsForMode")}</p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" size="lg" disabled={available === 0} onClick={start}>
          {trial ? t("startTrial") : t("startSession", { count: Math.min(count, available) })}
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={`/decks?deck=${deckId}&view=cards`}>{t("backToDeck")}</Link>
        </Button>
      </div>
    </main>
  );
}

const modeCopy: Record<StudyMode, { title: "modeNew" | "modeReview" | "modeMix" | "modeTrial"; hint: "modeNewHint" | "modeReviewHint" | "modeMixHint" | "modeTrialHint" }> = {
  new: { title: "modeNew", hint: "modeNewHint" },
  review: { title: "modeReview", hint: "modeReviewHint" },
  mix: { title: "modeMix", hint: "modeMixHint" },
  trial: { title: "modeTrial", hint: "modeTrialHint" },
};

function cardsForMode(mode: StudyMode, fresh: number, current: number) {
  if (mode === "new") {
    return fresh;
  }

  if (mode === "review") {
    return current;
  }

  if (mode === "trial") {
    return fresh + current;
  }

  return fresh + current;
}
