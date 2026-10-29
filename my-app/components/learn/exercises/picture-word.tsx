"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { AnswerPop, answerTone } from "@/components/learn/exercises/answer-mark";
import { ExerciseChrome } from "@/components/learn/exercises/lesson-session";
import { useAdvance } from "@/components/learn/exercises/use-advance";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isOptimizedWordImage } from "@/lib/content/word-image";
import { playStudyClip } from "@/lib/learn/pathway/play-study";
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
        {item.direction === "picture-hebrew" && !picture ? (
          <Skeleton className="h-40 w-full max-w-xs rounded-3xl" />
        ) : picture ? (
          <WordPicture src={picture} />
        ) : answer ? (
          <PromptWord word={answer} hebrew={item.direction === "hebrew-english"} locale={locale} />
        ) : null}
        {item.direction === "picture-hebrew" && !picture ? null : (
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
                    if (item.direction !== "picture-hebrew") {
                      const hebrew = choice.niqqud || choice.hebrew;
                      void playStudyClip({ hebrew, say: hebrew, audio: choice.audio ?? undefined });
                    }
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
        )}
      </div>
    </ExerciseChrome>
  );
}

function WordPicture({ src }: { src: string }) {
  return (
    <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-3xl">
      <Skeleton className="absolute inset-0 size-full rounded-3xl" />
      {isOptimizedWordImage(src) ? (
        <Image src={src} alt="" fill sizes="320px" className="object-cover" />
      ) : (
        // Hosts outside images.remotePatterns cannot use the optimizer.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" decoding="async" className="relative size-full object-cover" />
      )}
    </div>
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
