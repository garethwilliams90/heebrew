"use client";

import { useTranslations } from "next-intl";

export function ReadingIntro() {
  const t = useTranslations("Learn");

  return (
    <div className="flex h-full min-h-0 w-full max-w-xl flex-col items-center gap-4 overflow-y-auto px-2 py-2 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">{t("readingIntroTitle")}</h1>
      <p className="text-base text-emerald-900/80 sm:text-lg">{t("readingIntroBody")}</p>
      <p className="text-base text-emerald-900/80">{t("readingIntroNikud")}</p>
      <p className="text-base font-medium text-emerald-900">{t("readingIntroDecks")}</p>
    </div>
  );
}
