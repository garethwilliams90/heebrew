"use client";

import { useTranslations } from "next-intl";
import { ExperienceAward } from "@/components/flashcards/experience-award";
import { LeafHeroScreen } from "@/components/leaf-hero-screen";
import { Button } from "@/components/ui/button";

export function TrainingIntro({ onStart, generating }: { onStart: () => void; generating?: boolean }) {
  const t = useTranslations("Training");

  return (
    <LeafHeroScreen
      title={t("title")}
      body={t("description")}
      bodyClassName="mt-3 max-w-md text-emerald-900/70"
      actions={
        <Button
          className="h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900"
          onClick={onStart}
          disabled={generating}
        >
          {generating ? t("generating") : t("start")}
        </Button>
      }
    />
  );
}

export function TrainingResults({
  correct,
  total,
  reward,
  onAgain,
}: {
  correct: number;
  total: number;
  reward: { from: number; to: number } | null;
  onAgain: () => void;
}) {
  const t = useTranslations("Training");

  return (
    <LeafHeroScreen
      title={t("completeTitle")}
      body={t("completeBody", { correct, total })}
      actions={
        <Button className="h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900" onClick={onAgain}>
          {t("trainAgain")}
        </Button>
      }
    >
      {reward ? <ExperienceAward from={reward.from} to={reward.to} /> : null}
    </LeafHeroScreen>
  );
}
