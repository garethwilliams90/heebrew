"use client";

import { useTranslations } from "next-intl";
import { ConceptSlide } from "@/components/learn/hear-cards";

export function ReadingIntro() {
  const t = useTranslations("Learn");

  return (
    <ConceptSlide title={t("readingIntroTitle")}>
      <p className="text-base text-emerald-900/80 sm:text-lg">{t("readingIntroBody")}</p>
      <p className="text-base text-emerald-900/80">{t("readingIntroNikud")}</p>
      <p className="text-base font-medium text-emerald-900">{t("readingIntroDecks")}</p>
    </ConceptSlide>
  );
}
