"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrainingSetup({
  onStart,
}: {
  onStart: (questionCount: number, userLevel: 1 | 2 | 3) => void;
}) {
  const t = useTranslations("Training");
  const [questionCount, setQuestionCount] = useState(5);
  const [userLevel, setUserLevel] = useState<1 | 2 | 3>(1);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-6">
      <GraduationCap className="size-12 text-emerald-800" aria-hidden />
      
      <div className="max-w-2xl space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-emerald-950">
          {t("setupTitle")}
        </h2>
        
        <div className="space-y-3 text-left text-emerald-900/80">
          <p>{t("setupIntro")}</p>
          
          <div className="rounded-xl bg-emerald-50/50 p-4 space-y-2">
            <p className="font-medium text-emerald-950">{t("setupBinyanim")}</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{t("setupPaal")}</li>
              <li>{t("setupPiel")}</li>
              <li>{t("setupHifil")}</li>
            </ul>
          </div>
          
          <p>{t("setupLevels")}</p>
        </div>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-emerald-950">
            {t("setupQuestionCount")}
          </label>
          <div className="flex gap-2">
            {[5, 7, 10].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={`flex-1 rounded-lg border-2 px-4 py-3 font-semibold transition-colors ${
                  questionCount === count
                    ? "border-emerald-800 bg-emerald-50 text-emerald-900"
                    : "border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-emerald-950">
            {t("setupDifficulty")}
          </label>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setUserLevel(level)}
                className={`flex-1 rounded-lg border-2 px-4 py-3 font-semibold transition-colors ${
                  userLevel === level
                    ? "border-emerald-800 bg-emerald-50 text-emerald-900"
                    : "border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300"
                }`}
              >
                {t(`setupLevel${level}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        className="h-12 bg-emerald-800 px-8 text-white hover:bg-emerald-900"
        onClick={() => onStart(questionCount, userLevel)}
      >
        {t("setupStart")}
      </Button>
    </div>
  );
}
