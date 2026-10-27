"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnswerPop, answerTone, type AnswerTone } from "@/components/learn/exercises/answer-mark";
import { ExerciseChrome } from "@/components/learn/exercises/lesson-session";
import { useAdvance } from "@/components/learn/exercises/use-advance";
import { printFont } from "@/components/alephbet/print-font";
import { Button } from "@/components/ui/button";
import { normalizeHebrew } from "@/lib/learn/hebrew-text";
import { playStudyClip } from "@/lib/learn/pathway/play-study";
import type { Gloss, ReadItem } from "@/lib/learn/pathway/types";
import { GlossLabel } from "@/components/learn/gloss-label";

function loose(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[.,!?;:'"׳״\-]/g, "")
    .replace(/\s+/g, " ");
}

function matchesGloss(input: string, gloss: Gloss) {
  const typed = loose(input);
  return [gloss.en, gloss.fr, gloss.es].some((line) => loose(line) === typed);
}

export function ReadTranslation({
  items,
  onPass,
  onMiss,
}: {
  items: readonly ReadItem[];
  onPass: () => void;
  onMiss?: () => void;
}) {
  return <TypedAnswer items={items} mode="read" onPass={onPass} onMiss={onMiss} />;
}

export function WriteHebrew({
  items,
  onPass,
  onMiss,
}: {
  items: readonly ReadItem[];
  onPass: () => void;
  onMiss?: () => void;
}) {
  return <TypedAnswer items={items} mode="write" onPass={onPass} onMiss={onMiss} />;
}

function TypedAnswer({
  items,
  mode,
  onPass,
  onMiss,
}: {
  items: readonly ReadItem[];
  mode: "read" | "write";
  onPass: () => void;
  onMiss?: () => void;
}) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [tone, setTone] = useState<AnswerTone>(null);
  const item = items[index];
  const advance = useAdvance(() => {
    if (index >= items.length - 1) {
      onPass();
      return;
    }
    setTone(null);
    setValue("");
    setIndex((current) => current + 1);
  }, onMiss);

  if (!item) {
    return null;
  }

  const writing = mode === "write";

  function check() {
    const correct = writing ? normalizeHebrew(value) === normalizeHebrew(item.hebrew) : matchesGloss(value, item.gloss);
    if (!correct) {
      setTone("wrong");
      advance.miss(() => void playStudyClip({ hebrew: item.hebrew, say: item.hebrew, audio: item.audio }));
      return;
    }
    setTone("correct");
    advance.pass();
  }

  return (
    <ExerciseChrome index={index} total={items.length} prompt={writing ? t("writePrompt") : t("readPrompt")}>
    <form
      className="flex w-full max-w-xl flex-col items-center gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        check();
      }}
    >
      <p className={writing ? "text-2xl text-emerald-950" : `${printFont.className} text-4xl text-emerald-950`} dir={writing ? "ltr" : "rtl"} lang={writing ? locale : "he"}>
        {writing ? <GlossLabel gloss={item.gloss} /> : item.hebrew}
      </p>
      <AnswerPop tone={tone} className="w-full">
        <input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setTone(null);
          }}
          placeholder={t("answerPlaceholder")}
          dir={writing ? "rtl" : "ltr"}
          lang={writing ? "he" : locale}
          className={`w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-xl ${writing ? printFont.className : ""} ${answerTone(tone)}`}
        />
      </AnswerPop>
      <Button type="submit" disabled={tone === "wrong"}>{t("checkAnswer")}</Button>
    </form>
    </ExerciseChrome>
  );
}
