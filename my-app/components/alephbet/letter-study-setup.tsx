"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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

      <section className="mt-8">
        <h2 id="letter-amount" className="text-lg font-semibold">
          {flashcards("cardAmount")}
        </h2>
        <div className="mt-4 flex items-center gap-4">
          <Slider
            min={1}
            max={limit}
            step={1}
            value={[Math.min(count, limit)]}
            aria-labelledby="letter-amount"
            onValueChange={(value) => {
              const next = value[0];
              if (typeof next === "number") {
                onCount(next);
              }
            }}
          />
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={limit}
            value={Math.min(count, limit)}
            aria-labelledby="letter-amount"
            className="h-11 w-20 border-emerald-900/10 bg-white text-center"
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isInteger(next)) {
                onCount(Math.min(limit, Math.max(1, next)));
              }
            }}
          />
        </div>
      </section>

      <fieldset className="mt-8">
        <legend className="text-lg font-semibold">{t("practiceKind")}</legend>
        <div className="mt-3 grid gap-3">
          {kinds.map((option) => {
            const optionCount = option === "nikud" ? nikudTotal : letterTotal;
            const selected = kind === option;
            return (
              <Choice
                key={option}
                name="practice-kind"
                selected={selected}
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
              <Choice
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

function Choice({
  name,
  selected,
  title,
  hint,
  countLabel,
  onSelect,
}: {
  name: string;
  selected: boolean;
  title: string;
  hint: string;
  countLabel?: string;
  onSelect: () => void;
}) {
  return (
    <label
      className={`rounded-3xl border px-4 py-4 ${
        selected
          ? "cursor-pointer border-emerald-700 bg-white shadow-[0_16px_40px_-28px_rgba(6,78,59,0.6)]"
          : "cursor-pointer border-emerald-950/10 bg-white/80"
      }`}
    >
      <input type="radio" name={name} className="sr-only" checked={selected} onChange={onSelect} />
      <span className="block font-medium">{title}</span>
      <span className="mt-1 block text-sm text-emerald-900/70">{hint}</span>
      {countLabel ? <span className="mt-2 block text-sm text-emerald-800">{countLabel}</span> : null}
    </label>
  );
}
