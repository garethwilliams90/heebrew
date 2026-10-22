"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { useCue } from "@/components/settings/use-cue";
import { printFont } from "@/components/alephbet/print-font";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { HearReplayButton } from "@/components/learn/hear-replay";
import { HeartRow, HintButton } from "@/components/learn/practice-hearts";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { addExperience } from "@/lib/flashcards/experience";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { mix, glossOf, type BuilderSentence, type SentenceWord } from "@/lib/learn/sentences";
import { playAudio } from "@/lib/settings/master-volume";
import { cn } from "cn";

const lessonExperience = 6;
const cardSpring = { type: "spring" as const, bounce: 0.28, visualDuration: 0.22 };

export function SentenceBuilder({
  rounds,
  onPass,
}: {
  rounds: readonly BuilderSentence[];
  onPass: () => void;
}) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<(string | null)[]>(() => rounds[0]?.words.map(() => null) ?? []);
  const [bank, setBank] = useState<SentenceWord[]>(() => mix(rounds[0]?.words ?? []));
  const [revealed, setRevealed] = useState(false);
  const [halves, setHalves] = useState(10);
  const [failed, setFailed] = useState(false);
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

  const hear = useCallback(async (text: string) => {
    const id = playId.current + 1;
    playId.current = id;
    const audio = await loadSpeechClip(text);
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
    setBank(mix(round.words));
    setRevealed(false);
    setShake(false);
    void loadSpeechClip(round.hebrew);
    for (const word of round.words) {
      void loadSpeechClip(word.hebrew);
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

  function loseHeart(cost: number) {
    setHalves((current) => {
      const next = Math.max(0, current - cost);
      if (next <= 0) {
        setFailed(true);
      }
      return next;
    });
  }

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
      const returning = occupant ? round.words.find((item) => item.id === occupant) : undefined;
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
    const word = round.words.find((item) => item.id === wordId);
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
    const correct = round.words.every((word, index) => nextPlaced[index] === word.id);
    if (!correct) {
      playWrong();
      loseHeart(2);
      setShake(true);
      window.setTimeout(() => {
        setShake(false);
        setPlaced(round.words.map(() => null));
        setBank(mix(round.words));
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
    setHalves(10);
    setFailed(false);
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
      void addExperience(rounds.length * lessonExperience);
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
      <div className="w-full">
        <ProgressMeter
          label={t("quizProgress", { done: question, total: rounds.length })}
          value={question}
          max={rounds.length}
          ratio={ratio}
          sections={rounds.length}
          className="h-2.5 rounded-full bg-emerald-950/10"
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <HeartRow hearts={halves / 2} />
        <HintButton disabled={failed || revealed || halves < 1 || bank.length < 1} onHint={hint} />
      </div>
      <p className="text-center text-base text-emerald-900/80 sm:text-lg">
        {failed ? t("outOfHearts") : revealed ? t("sentenceBuilt") : t("sentenceBuildPrompt")}
      </p>
      {failed ? (
        <Button type="button" className="h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900" onClick={retry}>
          {t("tryAgain")}
        </Button>
      ) : null}
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
              const occupying = placed[slot] ? round.words.find((item) => item.id === placed[slot]) : undefined;
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
                      onHear={() => void hear(occupying.hebrew)}
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
                    onHear={() => void hear(word.hebrew)}
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
  onHear: () => void;
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
              onHear();
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
