"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Volume2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { cursiveFont } from "@/components/alephbet/cursive-font";
import { cardShadow, letterLayoutId, letterTransition } from "@/components/alephbet/letter-card";
import { MasteryRing } from "@/components/flashcards/mastery-ring";
import { Button } from "@/components/ui/button";
import { highlightLetter, type LetterFact } from "@/lib/alephbet/letter-info";

const glyphFade = { duration: 0.15, ease: "easeOut" as const };

export function LetterDialog({
  fact,
  mastery,
  cursive: cursiveAtOpen,
  soundOn,
  onClose,
  onPlay,
}: {
  fact: LetterFact;
  mastery: number;
  cursive: boolean;
  soundOn: boolean;
  onClose: () => void;
  onPlay: (letter: string) => void;
}) {
  const t = useTranslations("AlephBet");
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [cursive, setCursive] = useState(cursiveAtOpen);
  const noteKey = `facts.${fact.id}.note`;
  const note = t.has(noteKey) ? t(noteKey) : null;
  const meta = [
    fact.alphabet ? t("letterOfAlphabet", { number: fact.alphabet }) : null,
    fact.base ? t("finalForm", { number: fact.base }) : null,
    fact.value != null ? t("numberValue", { value: fact.value }) : null,
  ]
    .filter((part) => part != null)
    .join(" · ");

  useEffect(() => {
    setCursive(cursiveAtOpen);
  }, [cursiveAtOpen]);

  useEffect(() => {
    panelRef.current?.focus({ preventScroll: true });
  }, []);

  function trapTab(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !panelRef.current) return;
    const items = [...panelRef.current.querySelectorAll<HTMLElement>("button:not(:disabled)")];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      layoutId={letterLayoutId(fact.letter)}
      transition={letterTransition}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={trapTab}
      style={{ borderRadius: 28, boxShadow: cardShadow }}
      className="pointer-events-auto w-full max-w-xl cursor-auto bg-card outline-none"
    >
      <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto px-5 py-5 sm:px-8 sm:py-6" style={{ borderRadius: 28 }}>
        <div className="sticky top-0 z-10 -mx-5 flex items-center justify-between gap-3 bg-card px-5 py-1 sm:-mx-8 sm:px-8">
          <MasteryRing level={mastery} />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t("hearLetter")}
              disabled={!soundOn}
              onClick={() => onPlay(fact.letter)}
            >
              <Volume2 />
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label={t("closeLetter")} onClick={onClose}>
              <X />
            </Button>
          </div>
        </div>

        <div className="mt-2 flex h-32 items-center justify-center sm:h-40">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={cursive ? "cursive" : "print"}
              dir="rtl"
              lang="he"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={glyphFade}
              className={cn(
                "block leading-none",
                cursive ? cn("text-8xl sm:text-9xl", cursiveFont.className) : "text-8xl font-bold sm:text-9xl",
              )}
            >
              {fact.letter}
            </motion.span>
          </AnimatePresence>
        </div>

        <p className="text-center text-2xl font-semibold tracking-wide text-emerald-800">{fact.sound}</p>
        <p id={titleId} className="mt-1 text-center text-lg text-muted-foreground">
          {fact.name}
        </p>
        <p dir="rtl" lang="he" className="text-center text-2xl leading-normal text-emerald-950">
          {fact.spoken}
        </p>

        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" variant={cursive ? "outline" : "default"} aria-pressed={!cursive} onClick={() => setCursive(false)}>
            {t("printScript")}
          </Button>
          <Button type="button" variant={cursive ? "default" : "outline"} aria-pressed={cursive} onClick={() => setCursive(true)}>
            {t("cursiveScript")}
          </Button>
        </div>

        {meta ? <p className="mt-4 text-center text-sm text-muted-foreground">{meta}</p> : null}
        <p className="mt-4 text-sm leading-relaxed">{t(`facts.${fact.id}.description`)}</p>
        {fact.kind === "sofit" ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("sofitTip")}</p> : null}
        {fact.kind === "loan" ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("loanNote")}</p> : null}
        {note ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note}</p> : null}

        <h2 className="mt-6 text-sm font-medium">{t("examplesTitle")}</h2>
        <ul className="mt-2">
          {fact.examples.map((example, index) => (
            <li
              key={example.word}
              className="flex items-baseline justify-between gap-4 border-b border-emerald-950/10 py-2.5 last:border-b-0"
            >
              <span dir="rtl" lang="he" className="text-2xl leading-none">
                {highlightLetter(example.word, fact.letter).map((part, partIndex) => (
                  <span
                    key={`${part.text}-${partIndex}`}
                    className={part.hit ? "rounded-sm bg-emerald-100 px-0.5 font-bold text-emerald-800" : undefined}
                  >
                    {part.text}
                  </span>
                ))}
              </span>
              <span className="text-end">
                <span className="block text-sm font-semibold text-emerald-900">{example.reading}</span>
                <span className="block text-sm text-muted-foreground">{t(`facts.${fact.id}.example${index + 1}`)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
