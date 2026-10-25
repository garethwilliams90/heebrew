"use client";

import { useTranslations } from "next-intl";
import { StudyAmountField } from "@/components/study/study-amount-field";
import { StudyOptionCard } from "@/components/study/study-option-card";
import { Button } from "@/components/ui/button";
import { LETTER_STUDY_MAX } from "@/lib/alephbet/letters";

export type PracticeKind = "letters" | "nikud";
export type ScriptChoice = "print" | "cursive" | "both";

const kinds: PracticeKind[] = ["letters", "nikud"];
const scripts: ScriptChoice[] = ["print", "cursive", "both"];

export function LetterStudySetup({
  kind,
  script,
  count,
  letterTotal,
  nikudTotal,
  onKind,
  onScript,
  onCount,
  onStart,
  onClose,
}: {
  kind: PracticeKind;
  script: ScriptChoice;
  count: number;
  letterTotal: number;
  nikudTotal: number;
  onKind: (kind: PracticeKind) => void;
  onScript: (script: ScriptChoice) => void;
  onCount: (count: number) => void;
  onStart: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("AlephBet");
  const flashcards = useTranslations("Flashcards");
  const available = kind === "nikud" ? nikudTotal : letterTotal;
  const limit = Math.min(LETTER_STUDY_MAX, Math.max(available, 1));
  const chosen = Math.min(count, limit, available);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">{t("studyTitle")}</h1>
      <p className="mt-2 text-sm text-emerald-900/70">{t("studySetup")}</p>

      <StudyAmountField labelId="letter-amount" title={flashcards("cardAmount")} count={count} limit={limit} onCount={onCount} />

      <fieldset className="mt-8">
        <legend className="text-lg font-semibold">{t("practiceKind")}</legend>
        <div className="mt-3 grid gap-3">
          {kinds.map((option) => {
            const optionCount = option === "nikud" ? nikudTotal : letterTotal;
            return (
              <StudyOptionCard
                key={option}
                name="practice-kind"
                selected={kind === option}
                title={t(option === "letters" ? "practiceLetters" : "practiceNikud")}
                hint={t(option === "letters" ? "practiceLettersHint" : "practiceNikudHint")}
                countLabel={flashcards("availableCount", { count: optionCount })}
                onSelect={() => onKind(option)}
              />
            );
          })}
        </div>
      </fieldset>

      {kind === "letters" ? (
        <fieldset className="mt-8">
          <legend className="text-lg font-semibold">{t("scriptChoice")}</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {scripts.map((option) => (
              <StudyOptionCard
                key={option}
                name="script-choice"
                selected={script === option}
                title={t(scriptTitle[option])}
                hint={t(scriptHint[option])}
                onSelect={() => onScript(option)}
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" size="lg" disabled={available === 0} onClick={onStart}>
          {flashcards("startSession", { count: chosen })}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={onClose}>
          {t("backToAlphabet")}
        </Button>
      </div>
    </main>
  );
}

const scriptTitle = {
  print: "printScript",
  cursive: "cursiveScript",
  both: "scriptBoth",
} as const;

const scriptHint = {
  print: "scriptPrintHint",
  cursive: "scriptCursiveHint",
  both: "scriptBothHint",
} as const;

