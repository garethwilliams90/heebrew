"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { useCue } from "@/components/settings/use-cue";
import { printFont } from "@/components/alephbet/print-font";
import { HearReplayButton } from "@/components/learn/hear-replay";
import { PracticeQuizHeader } from "@/components/learn/practice-quiz-header";
import { usePracticeHearts } from "@/components/learn/use-practice-hearts";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { addExperience } from "@/lib/flashcards/experience";
import { LESSON_EXPERIENCE } from "@/lib/learn/lesson-experience";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { loadBundleClip } from "@/lib/learn/bundle-clip";
import { mix, glossOf, type BuilderSentence, type SentenceWord } from "@/lib/learn/sentences";
import { playAudio } from "@/lib/settings/master-volume";
import { cn } from "cn";

const cardSpring = { type: "spring" as const, bounce: 0.28, visualDuration: 0.22 };

function piecesOf(round: BuilderSentence | undefined) {
  return [...(round?.words ?? []), ...(round?.extras ?? [])];
}

function bankFor(round: BuilderSentence | undefined) {
  return mix(piecesOf(round));
}

function pieceById(round: BuilderSentence, id: string) {
  return piecesOf(round).find((item) => item.id === id);
}

export function SentenceBuilder({
  rounds,
  onPass,
  exam = false,
}: {
  rounds: readonly BuilderSentence[];
  onPass: () => void;
  exam?: boolean;
}) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const lives = exam ? 3 : 5;
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<(string | null)[]>(() => rounds[0]?.words.map(() => null) ?? []);
  const [bank, setBank] = useState<SentenceWord[]>(() => bankFor(rounds[0]));
  const [revealed, setRevealed] = useState(false);
  const { halves, failed, loseHeart, resetHearts } = usePracticeHearts(lives);
  const [shake, setShake] = useState(false);
  const playWrong = useCue("wrong");
  const playSuccess = useCue("success");
  const passRef = useRef(onPass);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const playing = useRef<HTMLAudioElement | null>(null);
  const playId = useRef(0);
  const [replayDown, setReplayDown] = useState(false);
  const round = rounds[index];

  passRef.current = onPass;

  const hear = useCallback(async (text: string, audioPath?: string) => {
    const id = playId.current + 1;
    playId.current = id;
    const audio = audioPath ? await loadBundleClip(audioPath) : await loadSpeechClip(text);
    if (!audio || id !== playId.current) {
      return;
    }
    if (playing.current) {
      playing.current.pause();
      playing.current.currentTime = 0;
    }
    audio.currentTime = 0;
    playing.current = audio;
    try {
      await playAudio(audio);
    } catch {
      // Autoplay can wait for a gesture; Hear again still replays after a click.
    }
  }, []);

  useEffect(() => {
    if (!round) {
      return;
    }
    setPlaced(round.words.map(() => null));
    setBank(bankFor(round));
    setRevealed(false);
    setShake(false);
    void loadSpeechClip(round.hebrew);
    for (const word of piecesOf(round)) {
      if (word.audio) {
        void loadBundleClip(word.audio);
      } else {
        void loadSpeechClip(word.hebrew);
      }
    }
    void hear(round.hebrew);
    return () => {
      playId.current += 1;
      if (playing.current) {
        playing.current.pause();
        playing.current.currentTime = 0;
      }
    };
  }, [round, hear]);

  function placeWord(wordId: string, slot: number) {
    if (!round || revealed || failed) {
      return;
    }
    if (placed[slot] === wordId) {
      return;
    }

    const occupant = placed[slot];
    setBank((current) => {
      const without = current.filter((item) => item.id !== wordId);
      const returning = occupant ? pieceById(round, occupant) : undefined;
      return returning ? [...without, returning] : without;
    });
    const nextPlaced = placed.map((id, index) => (index === slot ? wordId : id === wordId ? null : id));
    setPlaced(nextPlaced);
    if (nextPlaced.every((id) => id)) {
      window.setTimeout(() => check(nextPlaced), 80);
    }
  }

  function returnWord(wordId: string) {
    if (!round || revealed || failed) {
      return;
    }
    const word = pieceById(round, wordId);
    if (!word) {
      return;
    }
    setPlaced((current) => current.map((id) => (id === wordId ? null : id)));
    setBank((current) => (current.some((item) => item.id === wordId) ? current : [...current, word]));
  }

  function check(nextPlaced: (string | null)[]) {
    if (!round || nextPlaced.some((id) => !id)) {
      return;
    }
    const correct = round.words.every((word, index) => {
      const placedId = nextPlaced[index];
      return placedId ? pieceById(round, placedId)?.hebrew === word.hebrew : false;
    });
    if (!correct) {
      playWrong();
      loseHeart(2);
      setShake(true);
      const kept = exam
        ? round.words.map(() => null)
        : round.words.map((word, index) => {
            const placedId = nextPlaced[index];
            if (!placedId) {
              return null;
            }
            return pieceById(round, placedId)?.hebrew === word.hebrew ? placedId : null;
          });
      window.setTimeout(() => {
        setShake(false);
        const keptIds = new Set(kept.filter((id) => id));
        setPlaced(kept);
        setBank(mix(piecesOf(round).filter((item) => !keptIds.has(item.id))));
      }, 420);
      return;
    }
    playSuccess();
    setRevealed(true);
  }

  function hint() {
    if (!round || revealed || failed || halves < 1) {
      return;
    }
    const empty = placed.findIndex((id) => !id);
    if (empty < 0) {
      return;
    }
    loseHeart(1);
    placeWord(round.words[empty].id, empty);
  }

  function retry() {
    const restart = rounds[0];
    if (!restart) {
      return;
    }
    resetHearts();
    setRevealed(false);
    setIndex(0);
    if (index === 0) {
      void hear(restart.hebrew);
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea")) {
        return;
      }
      if (!round || revealed || failed) {
        return;
      }
      if (event.key !== "r" && event.key !== "R") {
        return;
      }
      event.preventDefault();
      if (event.type === "keyup") {
        setReplayDown(false);
        return;
      }
      if (event.repeat) {
        return;
      }
      setReplayDown(true);
      void hear(round.hebrew);
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [round, revealed, failed, hear]);

  function next() {
    const following = index + 1;
    if (following >= rounds.length) {
      void addExperience(rounds.length * LESSON_EXPERIENCE);
      passRef.current();
      return;
    }
    const followingRound = rounds[following];
    setRevealed(false);
    setPlaced(followingRound.words.map(() => null));
    setBank(mix(followingRound.words));
    setIndex(following);
  }

  if (!round) {
    return null;
  }

  const question = Math.min(index + 1, rounds.length);
  const ratio = rounds.length === 0 ? 0 : ((index + (revealed ? 1 : 0.45)) / rounds.length) * 100;
  const translation = glossOf(round.gloss, locale);

  function dropAt(point: { x: number; y: number }, wordId: string) {
    const hit = slotRefs.current.findIndex((node) => {
      if (!node) {
        return false;
      }
      const box = node.getBoundingClientRect();
      return point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;
    });
    if (hit >= 0) {
      placeWord(wordId, hit);
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3">
      <PracticeQuizHeader
        question={question}
        total={rounds.length}
        ratio={ratio}
        halves={halves}
        failed={failed}
        lives={lives}
        showHint={!exam}
        prompt={revealed ? t("sentenceBuilt") : exam ? t("examBuildPrompt") : t("sentenceBuildPrompt")}
        hintDisabled={failed || revealed || halves < 1 || bank.length < 1}
        onHint={hint}
        onRetry={retry}
        showCount={false}
      />
      {revealed ? (
        <div className="flex max-w-xl flex-col items-center gap-3 text-center">
          <p className={cn(printFont.className, "text-4xl leading-snug text-black")} dir="rtl" lang="he">
            {round.hebrew}
          </p>
          <p className="text-lg text-emerald-900">{translation}</p>
          <Button type="button" className="h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900" onClick={next}>
            {t("next")}
          </Button>
        </div>
      ) : (
        <>
          <HearReplayButton pressed={replayDown} onHear={() => void hear(round.hebrew)}>
            <Volume2 /> {t("quizHear")}
          </HearReplayButton>
          <motion.div
            animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex min-h-24 w-full max-w-3xl flex-wrap items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-emerald-700/35 bg-white/70 p-3"
            dir="rtl"
          >
            {round.words.map((word, slot) => {
              const occupying = placed[slot] ? pieceById(round, placed[slot]) : undefined;
              return (
                <div
                  key={`${round.id}-slot-${slot}`}
                  ref={(node) => {
                    slotRefs.current[slot] = node;
                  }}
                  className="flex h-16 min-w-20 items-center justify-center rounded-2xl border border-emerald-950/10 bg-emerald-50/80 px-2"
                >
                  {occupying ? (
                    <WordChip
                      word={occupying}
                      locale={locale}
                      onHear={exam ? undefined : () => void hear(occupying.hebrew, occupying.audio)}
                      onDrop={(point) => dropAt(point, occupying.id)}
                      onReturn={() => returnWord(occupying.id)}
                    />
                  ) : (
                    <span className="text-xs text-emerald-800/50">{t("dropWordHere")}</span>
                  )}
                </div>
              );
            })}
          </motion.div>
          <div className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-2" dir="rtl">
            {failed
              ? null
              : bank.map((word) => (
                  <WordChip
                    key={word.id}
                    word={word}
                    locale={locale}
                    onHear={exam ? undefined : () => void hear(word.hebrew, word.audio)}
                    onDrop={(point) => dropAt(point, word.id)}
                    onPlace={() => {
                      const empty = placed.findIndex((id) => !id);
                      if (empty >= 0) {
                        placeWord(word.id, empty);
                      }
                    }}
                  />
                ))}
          </div>
        </>
      )}
    </div>
  );
}

function WordChip({
  word,
  locale,
  onHear,
  onDrop,
  onPlace,
  onReturn,
}: {
  word: SentenceWord;
  locale: string;
  onHear?: () => void;
  onDrop: (point: { x: number; y: number }) => void;
  onPlace?: () => void;
  onReturn?: () => void;
}) {
  const t = useTranslations("Learn");
  const meaning = glossOf(word.gloss, locale);
  const dragged = useRef(false);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          type="button"
          drag
          dragSnapToOrigin
          dragElastic={0.16}
          whileHover={{ scale: 1.04, y: -2 }}
          transition={cardSpring}
          className={cn(
            printFont.className,
            "z-10 flex h-14 min-w-16 cursor-grab items-center justify-center rounded-2xl border border-emerald-950/10 bg-white px-3 text-2xl text-black shadow-[0_12px_28px_-22px_rgba(6,78,59,0.9)] active:cursor-grabbing",
          )}
          dir="rtl"
          lang="he"
          aria-label={t("wordCard", { word: word.hebrew, meaning })}
          onDragStart={() => {
            dragged.current = false;
          }}
          onDragEnd={(_, info) => {
            dragged.current = Math.hypot(info.offset.x, info.offset.y) >= 12;
            if (dragged.current) {
              onDrop(info.point);
            }
          }}
          onClick={() => {
            if (!dragged.current) {
              onHear?.();
              onPlace?.();
            }
          }}
          onDoubleClick={onReturn}
        >
          {word.hebrew}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-white px-3 py-1.5 text-emerald-950 shadow-sm"
        arrowClassName="bg-white fill-white"
      >
        {meaning}
      </TooltipContent>
    </Tooltip>
  );
}
