"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import type { SpeechCue } from "@/lib/alephbet/intro-alphabet";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { wordsByIds } from "@/lib/learn/basic-words";
import { shuffleLetters } from "@/lib/alephbet/letters";
import { WordQuiz } from "@/components/learn/word-quiz";

const dagForms = [
  { id: "dag", hebrew: "דָּג", sound: "dag", gloss: true },
  { id: "dehg", hebrew: "דֵּג", sound: "dehg", gloss: false },
  { id: "deeg", hebrew: "דִּג", sound: "deeg", gloss: false },
  { id: "dohg", hebrew: "דֹּג", sound: "dohg", gloss: false },
  { id: "doog", hebrew: "דּוּג", sound: "doog", gloss: false },
];

const sofitPairs = [
  { open: "נ", end: "ן" },
  { open: "מ", end: "ם" },
  { open: "כ", end: "ך" },
  { open: "צ", end: "ץ" },
];

const letterSpring = { type: "spring" as const, bounce: 0.35, visualDuration: 0.22 };

export function LevelTwo({
  part,
  onPass,
}: {
  part: "outline" | "fish" | "sofit" | "sofitPairs" | "sofitQuiz" | "vowels" | "words";
  onPass: () => void;
}) {
  const t = useTranslations("Learn");

  if (part === "outline") {
    return (
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">{t("levelTwoTitle")}</h1>
        <p className="mt-3 text-base text-emerald-900/80 sm:text-lg">{t("levelTwoIntro")}</p>
        <ul className="mt-6 space-y-2 text-left text-emerald-950">
          <li>{t("levelTwoWords")}</li>
          <li>{t("levelTwoReading")}</li>
          <li>{t("levelTwoVowels")}</li>
          <li>{t("levelTwoSofit")}</li>
        </ul>
      </div>
    );
  }

  if (part === "fish") {
    return <FishLesson />;
  }

  if (part === "sofit") {
    return (
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("sofitTitle")}</h1>
        <p className="mt-3 text-base text-emerald-900/80">{t("sofitIntro")}</p>
        <div className={cn(printFont.className, "mt-8 flex justify-center gap-6 text-7xl text-black")} dir="rtl" lang="he">
          {sofitPairs.map((pair) => (
            <span key={pair.open}>{pair.open}</span>
          ))}
        </div>
      </div>
    );
  }

  if (part === "sofitPairs") {
    return (
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("sofitTitle")}</h1>
        <p className="mt-3 text-base text-emerald-900/80">{t("sofitWhen")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4" dir="ltr">
          {sofitPairs.map((pair) => (
            <div
              key={pair.open}
              className={cn(printFont.className, "flex items-center gap-3 rounded-3xl bg-white/80 px-5 py-4 text-6xl text-black")}
              lang="he"
            >
              <span>{pair.open}</span>
              <span className="text-2xl text-emerald-800">→</span>
              <span className="text-blue-600">{pair.end}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (part === "sofitQuiz") {
    return <WordQuiz words={wordsByIds(["ets", "shem", "ben", "gan", "dam"])} onPlay={playWord} onPass={onPass} />;
  }

  if (part === "vowels") {
    return (
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("vowelTitle")}</h1>
        <p className="mt-3 text-base text-emerald-900/80">{t("vowelBody")}</p>
        <p className="mt-3 text-base text-emerald-900/80">{t("silentBody")}</p>
        <div className={cn(printFont.className, "mt-8 flex flex-wrap justify-center gap-6 text-5xl text-black")} dir="rtl" lang="he">
          <Example word="לֹא" caption={t("silentLo")} />
          <Example word="אָב" caption={t("silentAv")} />
          <Example word="מָה" caption={t("silentMah")} />
        </div>
      </div>
    );
  }

  return <WordLesson onPass={onPass} />;
}

function FishLesson() {
  const t = useTranslations("Learn");
  const [form, setForm] = useState(dagForms[0]);

  return (
    <div className="flex max-w-xl flex-col items-center text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("fishTitle")}</h1>
      <p className="mt-3 text-base text-emerald-900/80">{t("fishBody")}</p>
      <button
        type="button"
        className={cn(printFont.className, "mt-8 text-8xl text-black")}
        dir="rtl"
        lang="he"
        onClick={() => void playWord({ text: form.hebrew })}
      >
        {form.hebrew}
      </button>
      <p className="mt-3 text-xl text-emerald-950">{form.gloss ? t("fishGloss") : form.sound}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {dagForms.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            whileHover={{ scale: 1.05, y: -3 }}
            transition={letterSpring}
            className={cn(
              printFont.className,
              "rounded-2xl bg-white/80 px-4 py-2 text-4xl text-black",
              form.id === item.id && "ring-2 ring-emerald-700",
            )}
            dir="rtl"
            lang="he"
            onClick={() => {
              setForm(item);
              void playWord({ text: item.hebrew });
            }}
          >
            {item.hebrew}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function Example({ word, caption }: { word: string; caption: string }) {
  return (
    <button type="button" className="flex flex-col items-center gap-2" onClick={() => void playWord({ text: word })}>
      <span>{word}</span>
      <span className="font-sans text-sm text-emerald-800">{caption}</span>
    </button>
  );
}

function WordLesson({ onPass }: { onPass: () => void }) {
  const [words] = useState(() => shuffleLetters(wordsByIds(basicWordIds)).slice(0, 5));
  return <WordQuiz words={words} onPlay={playWord} onPass={onPass} learn />;
}

const basicWordIds = [
  "dag",
  "gag",
  "ets",
  "shem",
  "ben",
  "bat",
  "yad",
  "dam",
  "lev",
  "peh",
  "av",
  "em",
  "gan",
  "har",
  "yam",
] as const;

async function playWord(cue: SpeechCue) {
  const audio = await loadSpeechClip(cue.text);
  if (!audio) {
    return;
  }
  audio.currentTime = 0;
  await audio.play().catch(() => undefined);
}
