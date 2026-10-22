"use client";

import { Leaf } from "lucide-react";
import { useTranslations } from "next-intl";
import { ExperienceAward } from "@/components/flashcards/experience-award";
import { Button } from "@/components/ui/button";

export function TrainingIntro({ onStart, generating }: { onStart: () => void; generating?: boolean }) {
  const t = useTranslations("Training");

  return (
    <section className="flex flex-1 flex-col items-center justify-center text-center">
      <Leaf className="mb-4 size-8 text-emerald-800" aria-hidden />
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("title")}</h1>
      <p className="mt-3 max-w-md text-emerald-900/70">{t("description")}</p>
      <Button 
        className="mt-8 h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900" 
        onClick={onStart}
        disabled={generating}
      >
        {generating ? t("generating") : t("start")}
      </Button>
    </section>
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
    <section className="flex flex-1 flex-col items-center justify-center text-center">
      <Leaf className="mb-4 size-8 text-emerald-800" aria-hidden />
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("completeTitle")}</h1>
      <p className="mt-3 max-w-sm text-emerald-900/70">{t("completeBody", { correct, total })}</p>
      {reward ? <ExperienceAward from={reward.from} to={reward.to} /> : null}
      <Button className="mt-8 h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900" onClick={onAgain}>
        {t("trainAgain")}
      </Button>
    </section>
  );
}
