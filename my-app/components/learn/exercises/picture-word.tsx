"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { AnswerPop, answerTone } from "@/components/learn/exercises/answer-mark";
import { ExerciseChrome } from "@/components/learn/exercises/lesson-session";
import { useAdvance } from "@/components/learn/exercises/use-advance";
import { Button } from "@/components/ui/button";
import type { PictureWordItem } from "@/lib/learn/pathway/types";
import type { CatalogWord } from "@/lib/learn/words/catalog";
import { wordById } from "@/lib/learn/words/catalog";
import { getWordImagesByKeys } from "@/lib/vocabulary/db";

export function PictureWord({ items, onPass, onMiss }: { items: readonly PictureWordItem[]; onPass: () => void; onMiss?: () => void }) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState<Record<string, string> | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [rightId, setRightId] = useState<string | null>(null);
  const skipped = useRef(new Set<string>());
  const passRef = useRef(onPass);
  passRef.current = onPass;
  const advance = useAdvance(() => {
    if (index >= items.length - 1) {
      onPass();
      return;
    }
    setWrongIds([]);
    setHidden([]);
    setRightId(null);
    setIndex((current) => current + 1);
  }, onMiss);
  const item = items[index];

  useEffect(() => {
    if (items.length === 0) passRef.current();
  }, [items.length]);

  useEffect(() => {
    const keys = items.filter((entry) => entry.direction === "picture-hebrew").map((entry) => entry.answerId);
    if (keys.length === 0) {
      setImages({});
      return;
    }
    let cancel = false;
    void getWordImagesByKeys(keys).then((found) => {
      if (!cancel) setImages(found);
    });
    return () => {
      cancel = true;
    };
  }, [items]);

  useEffect(() => {
    if (!item || images === null) return;
    if (item.direction !== "picture-hebrew" || images[item.answerId]) return;
    if (skipped.current.has(item.id)) return;
    skipped.current.add(item.id);
    if (index >= items.length - 1) {
      passRef.current();
      return;
    }
    setWrongIds([]);
    setHidden([]);
    setRightId(null);
    setIndex((current) => current + 1);
  }, [images, index, item, items.length]);

  if (!item) return null;

  const answer = wordById(item.answerId);
  const picture = item.direction === "picture-hebrew" ? images?.[item.answerId] : null;
  const waiting = item.direction === "picture-hebrew" && images === null;
  const choices = item.choiceIds.flatMap((id) => {
    const word = wordById(id);
    return word && !hidden.includes(id) ? [word] : [];
  });
  const canHint = item.choiceIds.some((id) => id !== item.answerId && !hidden.includes(id) && !wrongIds.includes(id));

  function hint() {
    const pick = item?.choiceIds.find((id) => id !== item.answerId && !hidden.includes(id) && !wrongIds.includes(id));
    if (pick) setHidden((current) => [...current, pick]);
  }

  return (
    <ExerciseChrome index={index} total={items.length} prompt={promptFor(item.direction, t)} canHint={canHint} onHint={hint}>
      <div className="flex w-full max-w-xl flex-col items-center gap-6">
        {waiting ? (
          <div className="h-40 w-full max-w-xs animate-pulse rounded-3xl bg-emerald-950/10" />
        ) : picture ? (
          <img src={picture} alt="" className="h-40 w-full max-w-xs rounded-3xl object-cover" />
        ) : answer ? (
          <PromptWord word={answer} hebrew={item.direction === "hebrew-english"} locale={locale} />
        ) : null}
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {choices.map((choice) => {
            const tone = rightId === choice.id ? "correct" : wrongIds.includes(choice.id) ? "wrong" : null;
            const hebrewChoice = item.direction !== "hebrew-english";
            return (
              <AnswerPop key={choice.id} tone={tone} className="min-w-0">
                <Button
                  type="button"
                  sound={false}
                  variant="outline"
                  disabled={Boolean(rightId) || wrongIds.includes(choice.id)}
                  className={cn(
                    "h-auto w-full min-w-0 whitespace-normal px-4 py-4 text-center leading-snug",
                    hebrewChoice ? cn("text-3xl", printFont.className) : "text-lg",
                    answerTone(tone),
                  )}
                  lang={hebrewChoice ? "he" : undefined}
                  dir={hebrewChoice ? "rtl" : "ltr"}
                  onClick={() => {
                    if (rightId || wrongIds.includes(choice.id)) return;
                    if (choice.id === item.answerId) {
                      setRightId(choice.id);
                      advance.pass();
                      return;
                    }
                    setWrongIds((current) => [...current, choice.id]);
                    advance.miss();
                  }}
                >
                  {hebrewChoice ? choice.niqqud || choice.hebrew : glossOf(choice, locale)}
                </Button>
              </AnswerPop>
            );
          })}
        </div>
      </div>
    </ExerciseChrome>
  );
}

function PromptWord({ word, hebrew, locale }: { word: CatalogWord; hebrew: boolean; locale: string }) {
  if (hebrew) {
    return (
      <p dir="rtl" lang="he" className={cn("text-5xl leading-none text-emerald-950", printFont.className)}>
        {word.niqqud || word.hebrew}
      </p>
    );
  }
  return <p className="text-center text-3xl font-semibold text-emerald-950">{glossOf(word, locale)}</p>;
}

function glossOf(word: CatalogWord, locale: string) {
  if (locale === "fr") return word.fr;
  if (locale === "es") return word.es;
  return word.en;
}

function promptFor(direction: PictureWordItem["direction"], t: (key: "picturePrompt" | "englishHebrewPrompt" | "hebrewEnglishPrompt") => string) {
  if (direction === "picture-hebrew") return t("picturePrompt");
  if (direction === "english-hebrew") return t("englishHebrewPrompt");
  return t("hebrewEnglishPrompt");
}
