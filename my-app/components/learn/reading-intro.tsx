"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ReadingIntro({ onNext }: { onNext: () => void }) {
  const t = useTranslations("Learn");

  return (
    <div className="flex max-h-full w-full max-w-xl flex-col items-center gap-4 overflow-y-auto px-2 py-2 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">{t("readingIntroTitle")}</h1>
      <p className="text-base text-emerald-900/80 sm:text-lg">{t("readingIntroBody")}</p>
      <p className="text-base text-emerald-900/80">{t("readingIntroNikud")}</p>
      <p className="text-base font-medium text-emerald-900">{t("readingIntroDecks")}</p>
      <Button type="button" className="h-11 shrink-0 bg-emerald-800 px-5 text-white hover:bg-emerald-900" onClick={onNext}>
        {t("next")}
      </Button>
    </div>
  );
}
