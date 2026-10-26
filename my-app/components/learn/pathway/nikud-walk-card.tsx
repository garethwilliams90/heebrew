"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { printFont } from "@/components/alephbet/print-font";
import { Button } from "@/components/ui/button";
import { nikudCue, nikudCycle } from "@/lib/alephbet/intro-alphabet";
import { letterById } from "@/lib/alephbet/letter-lookup";
import { playCue } from "@/lib/learn/play-cue";
import { cn } from "cn";

const enter = { type: "spring" as const, bounce: 0.12, visualDuration: 0.28 };

const sounds = {
  kamatz: "vowelAh",
  patach: "vowelAh",
  tsere: "vowelEh",
  segol: "vowelEh",
  shva: "vowelNone",
  hiriq: "vowelEe",
  kubutz: "vowelOo",
  shuruk: "vowelOo",
  holam: "vowelOh",
  holamVav: "vowelOh",
} as const;

export function NikudWalkCard({ nikudId }: { nikudId: string }) {
  const t = useTranslations("Learn");
  const place = nikudCycle.findIndex((item) => item.id === nikudId);
  const nikud = nikudCycle[place];
  const [showNames, setShowNames] = useState(true);

  useEffect(() => {
    const fact = letterById.get("bet");
    if (!fact || !nikudCycle.some((item) => item.id === nikudId)) return;
    void playCue(nikudCue(fact, nikudId));
  }, [nikudId]);

  const fact = letterById.get("bet");
  if (!fact || !nikud || place < 0) {
    return null;
  }

  const active = fact;
  const mark = nikud;
  const pointed = nikudCue(active, mark.id);
  const soundKey = sounds[mark.id];
  const name = t(mark.label);
  const sound = t(soundKey);

  function hear() {
    void playCue(pointed);
  }

  return (
    <div className="mx-auto flex h-full max-h-full min-h-0 w-full max-w-xl flex-1 flex-col items-center gap-4 self-stretch overflow-y-auto px-2 py-2">
      <div className="flex w-full items-center justify-between gap-3">
        <p className="text-sm font-medium text-emerald-900/70">
          {t("letterWalkProgress", { current: place + 1, total: nikudCycle.length + 1 })}
        </p>
        <Button type="button" variant="ghost" className="h-9 px-3 text-sm" onClick={() => setShowNames((value) => !value)}>
          {showNames ? t("letterWalkNamesHide") : t("letterWalkNamesShow")}
        </Button>
      </div>

      <motion.div
        key={mark.id}
        className="flex w-full flex-col items-center"
        initial={{ opacity: 0, transform: "translateY(12px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={enter}
      >
        <div className="flex w-full flex-col items-center gap-4 rounded-[2rem] bg-white/85 px-6 py-10 shadow-[0_24px_50px_-36px_rgba(6,78,59,0.7)]">
          <span dir="rtl" lang="he" className={cn(printFont.className, "text-8xl leading-none text-emerald-950 sm:text-9xl")}>
            {pointed.text}
          </span>
          {showNames ? <p className="text-2xl font-semibold tracking-tight text-emerald-950">{name}</p> : null}
          <p className="text-base font-medium text-emerald-900">{t("letterIntroSound", { sound })}</p>
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4"
            sound={false}
            aria-label={t("hearLetter", { name: `${name}, ${sound}` })}
            onClick={hear}
          >
            <Volume2 /> {t("letterIntroHear")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export function NikudOverview() {
  const t = useTranslations("Learn");
  const [showNames, setShowNames] = useState(true);
  const fact = letterById.get("bet");
  const total = nikudCycle.length + 1;

  if (!fact) return null;

  return (
    <div className="mx-auto flex h-full max-h-full min-h-0 w-full max-w-xl flex-1 flex-col items-center gap-4 self-stretch overflow-y-auto px-2 py-2">
      <div className="flex w-full items-center justify-between gap-3">
        <p className="text-sm font-medium text-emerald-900/70">{t("letterWalkProgress", { current: total, total })}</p>
        <Button type="button" variant="ghost" className="h-9 px-3 text-sm" onClick={() => setShowNames((value) => !value)}>
          {showNames ? t("letterWalkNamesHide") : t("letterWalkNamesShow")}
        </Button>
      </div>
      <motion.div
        className="flex w-full flex-col items-center gap-3"
        initial={{ opacity: 0, transform: "translateY(12px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={enter}
      >
        <div className="w-full text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-emerald-950">{t("nikudOverviewTitle")}</h1>
          <p className="mt-1 text-sm text-emerald-900/80">{t("nikudOverviewHint")}</p>
        </div>
        <ul className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
          {nikudCycle.map((mark) => {
            const pointed = nikudCue(fact, mark.id);
            const name = t(mark.label);
            const sound = t(sounds[mark.id]);
            return (
              <li key={mark.id}>
                <Button
                  type="button"
                  variant="outline"
                  sound={false}
                  className="h-auto w-full min-w-0 flex-col gap-1 rounded-2xl px-2 py-3 whitespace-normal!"
                  aria-label={t("hearLetter", { name: `${name}, ${sound}` })}
                  onClick={() => void playCue(pointed)}
                >
                  <span dir="rtl" lang="he" className={cn(printFont.className, "text-4xl leading-none text-emerald-950 sm:text-5xl")}>
                    {pointed.text}
                  </span>
                  {showNames ? <span className="text-sm font-semibold text-emerald-950">{name}</span> : null}
                  <span className="text-xs font-medium text-emerald-800">{t("letterIntroSound", { sound })}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}
