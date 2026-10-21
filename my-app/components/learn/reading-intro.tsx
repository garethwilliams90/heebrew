"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

const shelForms = [
  { hebrew: "שֶׁלִּי", label: "shelMine" },
  { hebrew: "שֶׁלְּךָ", label: "shelYours" },
  { hebrew: "שֶׁלּוֹ", label: "shelHis" },
  { hebrew: "שֶׁלָּהּ", label: "shelHers" },
  { hebrew: "שֶׁלָּנוּ", label: "shelOurs" },
  { hebrew: "שֶׁלָּכֶם", label: "shelYoursMen" },
  { hebrew: "שֶׁלָּכֶן", label: "shelYoursWomen" },
] as const;

function Hebrew({ children }: { children: ReactNode }) {
  return (
    <span className={cn(printFont.className, "text-[1.15em] text-black")} dir="rtl" lang="he">
      {children}
    </span>
  );
}

export function ReadingIntro({ level, onNext }: { level: 12 | 13; onNext: () => void }) {
  const t = useTranslations("Learn");

  return (
    <div className="flex max-h-full w-full max-w-xl flex-col items-center gap-4 overflow-y-auto px-2 py-2 text-center">
      {level === 12 ? (
        <>
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">{t("readingIntroTitle")}</h1>
          <p className="text-base text-emerald-900/80 sm:text-lg">{t("readingIntroBody")}</p>
          <p className="text-base text-emerald-900/80">{t("readingIntroNikud")}</p>
          <p className="text-base font-medium text-emerald-900">{t("readingIntroDecks")}</p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">
            {t.rich("shelTitle", { he: (chunks) => <Hebrew>{chunks}</Hebrew> })}
          </h1>
          <p className="text-base text-emerald-900/80 sm:text-lg">
            {t.rich("shelMeaning", { he: (chunks) => <Hebrew>{chunks}</Hebrew> })}
          </p>
          <p className="text-base text-emerald-900/80">
            {t.rich("shelUse", { he: (chunks) => <Hebrew>{chunks}</Hebrew> })}
          </p>
          <p className="text-base text-emerald-900/80">{t("shelEndings")}</p>
          <ul className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
            {shelForms.map((form) => (
              <li key={form.label} className="flex flex-col items-center rounded-2xl bg-white/80 px-3 py-2 shadow-sm">
                <span className={cn(printFont.className, "text-2xl text-black")} dir="rtl" lang="he">
                  {form.hebrew}
                </span>
                <span className="text-sm text-emerald-900/75">{t(form.label)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <Button type="button" className="h-11 shrink-0 bg-emerald-800 px-5 text-white hover:bg-emerald-900" onClick={onNext}>
        {t("next")}
      </Button>
    </div>
  );
}
