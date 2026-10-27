"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { animate, motion, useAnimation, useMotionValue } from "motion/react";
import { useCue } from "@/components/settings/use-cue";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { HearReplayButton } from "@/components/learn/hear-replay";
import { HintButton } from "@/components/learn/practice-hearts";
import { PracticeQuizHeader } from "@/components/learn/practice-quiz-header";
import { usePracticeHearts } from "@/components/learn/use-practice-hearts";
import { PointedLetter } from "@/components/learn/pointed-letter";
import { addExperience } from "@/lib/flashcards/experience";
import { armAfterSpeech } from "@/lib/learn/arm-after-speech";
import { LESSON_EXPERIENCE } from "@/lib/learn/lesson-experience";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { nikudDropRounds, nikudSlot, type NikudDropOption, type NikudDropRound, type NikudSlot } from "@/lib/learn/nikud-drop";
import { takeLevelQuestions } from "@/lib/learn/pathway/question-batch";
import { rasterNikud, type NikudImage } from "@/lib/learn/nikud-raster";
import { nikudCue, type SpeechCue } from "@/lib/alephbet/intro-alphabet";

const homeSpring = { type: "spring" as const, bounce: 0.28, visualDuration: 0.32 };
const ghostSize = 64;
const maxInk = 60;

function inkSize(image: NikudImage | null) {
  if (!image) {
    return { width: ghostSize, height: ghostSize };
  }
  const scale = Math.min(1, maxInk / image.width, maxInk / image.height);
  return {
    width: Math.max(1, Math.round(image.width * scale)),
    height: Math.max(1, Math.round(image.height * scale)),
  };
}
const attractDistance = 118;
const lockDistance = 36;

export function NikudDropQuiz({
  letterIds = [],
  rounds: givenRounds,
  onPlay,
  onPass,
  hearts,
  showHeader = true,
  awardExperience = true,
  seed,
}: {
  letterIds?: readonly string[];
  rounds?: readonly NikudDropRound[];
  onPlay: (cue: SpeechCue) => void | Promise<void>;
  onPass: () => void;
  seed?: string;
  hearts?: {
    halves: number;
    failed: boolean;
    loseHeart: (cost: number) => void;
    resetHearts: () => void;
  };
  showHeader?: boolean;
  awardExperience?: boolean;
}) {
  const t = useTranslations("Learn");
  const [rounds] = useState(() =>
    givenRounds ? [...givenRounds] : takeLevelQuestions(nikudDropRounds(letterIds), seed ?? letterIds.join("-")),
  );
  const awardRef = useRef(awardExperience);
  awardRef.current = awardExperience;
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<string | null>(null);
  const [rejected, setRejected] = useState<string[]>([]);
  const [aim, setAim] = useState<NikudSlot | null>(null);
  const [ready, setReady] = useState(false);
  const ownHearts = usePracticeHearts();
  const halves = hearts?.halves ?? ownHearts.halves;
  const failed = hearts?.failed ?? ownHearts.failed;
  const loseHeart = hearts?.loseHeart ?? ownHearts.loseHeart;
  const resetHearts = hearts?.resetHearts ?? ownHearts.resetHearts;
  const [hidden, setHidden] = useState<string[]>([]);
  const answering = useRef(false);
  const playWrong = useCue("wrong");
  const playSuccess = useCue("success");
  const topSlot = useRef<HTMLDivElement>(null);
  const bottomSlot = useRef<HTMLDivElement>(null);
  const zoneMotion = useAnimation();
  const playRef = useRef(onPlay);
  const passRef = useRef(onPass);
  const generation = useRef(0);
  const armTimer = useRef<number | null>(null);
  const round = rounds[index];
  const done = index >= rounds.length;

  playRef.current = onPlay;
  passRef.current = onPass;

  useEffect(() => {
    for (const item of rounds) {
      void loadSpeechClip(item.prompt.text, item.prompt.phoneme);
    }
  }, [rounds]);

  useEffect(() => {
    if (!round) {
      return;
    }

    setRejected([]);
    beginPrompt(round.prompt, playRef, setReady, generation, armTimer);
    return () => {
      generation.current += 1;
      if (armTimer.current !== null) {
        window.clearTimeout(armTimer.current);
      }
    };
  }, [round]);

  useEffect(() => {
    if (!placed) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPlaced(null);
      setAim(null);
      setIndex((current) => {
        const next = current + 1;
        if (next >= rounds.length) {
          if (awardRef.current) {
            void addExperience(rounds.length * LESSON_EXPERIENCE);
          }
          passRef.current();
        }
        return next;
      });
    }, 880);

    return () => window.clearTimeout(timer);
  }, [placed, rounds.length]);

  function playThen(id: string, after: () => void) {
    const option = round?.options.find((item) => item.id === id);
    const cue = round && option ? nikudCue(round.letter, option.id) : null;
    void Promise.resolve(cue ? playRef.current(cue) : undefined).finally(after);
  }

  function reject(id: string) {
    if (!round) {
      return;
    }
    playWrong();
    setRejected((current) => (current.includes(id) ? current : [...current, id]));
    loseHeart(2);
    window.setTimeout(() => {
      answering.current = false;
      beginPrompt(round.prompt, playRef, setReady, generation, armTimer);
    }, 480);
    void zoneMotion.start({
      x: [0, -12, 12, -8, 8, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  }

  function choose(id: string) {
    if (!round || placed || !ready || failed || answering.current || rejected.includes(id)) {
      return false;
    }

    const correct = id === round.answerId;
    answering.current = true;
    if (!correct) {
      reject(id);
      return false;
    }

    playThen(id, () => {
      playSuccess();
      setRejected([]);
      setHidden([]);
      setPlaced(id);
      answering.current = false;
    });
    return true;
  }

  function miss(id: string) {
    if (placed || failed || answering.current || rejected.includes(id)) {
      return;
    }
    answering.current = true;
    reject(id);
  }

  function hint() {
    if (!round || failed || halves < 1 || placed) {
      return;
    }
    const wrongs = round.options.filter((item) => item.id !== round.answerId && !hidden.includes(item.id));
    const pick = wrongs[Math.floor(Math.random() * wrongs.length)];
    if (!pick) {
      return;
    }
    setHidden((current) => [...current, pick.id]);
    loseHeart(1);
  }

  function retry() {
    answering.current = false;
    resetHearts();
    setHidden([]);
    setPlaced(null);
    setRejected([]);
    setAim(null);
    setIndex(0);
  }

  function replay() {
    if (!round || placed) {
      return;
    }
    beginPrompt(round.prompt, playRef, setReady, generation, armTimer);
  }

  if (done || !round) {
    return null;
  }

  const question = Math.min(index + 1, rounds.length);
  const ratio = rounds.length === 0 ? 0 : ((index + 0.5) / rounds.length) * 100;
  const answer = round.options.find((option) => option.id === placed);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center gap-3">
      {showHeader ? (
        <div className="w-full shrink-0">
          <PracticeQuizHeader
            question={question}
            total={rounds.length}
            ratio={ratio}
            halves={halves}
            failed={failed}
            prompt={t("dropSlots")}
            hintDisabled={failed || halves < 1 || round.options.filter((item) => item.id !== round.answerId && !hidden.includes(item.id)).length < 1}
            onHint={hint}
            onRetry={retry}
          />
        </div>
      ) : null}
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <HearReplayButton onHear={replay}>{t("quizHear")}</HearReplayButton>
          {showHeader ? null : (
            <HintButton
              disabled={failed || halves < 1 || round.options.filter((item) => item.id !== round.answerId && !hidden.includes(item.id)).length < 1}
              onHint={hint}
            />
          )}
        </div>
        <motion.div
          animate={zoneMotion}
          className={cn(
            printFont.className,
            "relative h-52 w-48 rounded-3xl border-2 border-dashed border-emerald-700/40 bg-white text-7xl text-black shadow-[0_18px_40px_-28px_rgba(6,78,59,0.8)] sm:w-56",
            placed && "border-solid border-green-600 ring-4 ring-green-600/25",
          )}
          dir="rtl"
          lang="he"
          role="group"
          aria-label={t("dropTarget", { name: round.letter.name })}
        >
          <span className="absolute inset-0 flex items-center justify-center">
            {answer ? <PointedLetter letter={round.letter.letter} mark={answer.mark} tail={answer.tail} /> : round.letter.letter}
          </span>
          {placed ? null : (
            <>
              <div
                ref={topSlot}
                className={slotClass(aim === "top")}
                style={{ top: 12 }}
                aria-label={t("dropTop")}
              >
                <span className="text-xs font-medium tracking-wide text-blue-800/80 uppercase">{t("dropTop")}</span>
              </div>
              <div
                ref={bottomSlot}
                className={slotClass(aim === "bottom")}
                style={{ bottom: 12 }}
                aria-label={t("dropBottom")}
              >
                <span className="text-xs font-medium tracking-wide text-blue-800/80 uppercase">{t("dropBottom")}</span>
              </div>
            </>
          )}
        </motion.div>
        <div className="relative z-20 flex flex-wrap items-start justify-center gap-3 sm:gap-4">
          {failed
            ? null
            : round.options
                .filter((option) => !hidden.includes(option.id))
                .map((option, choice) => (
            <VowelChip
              key={`${round.id}-${option.id}`}
              option={option}
              index={choice}
              locked={!ready || Boolean(placed) || failed || rejected.includes(option.id)}
              dimmed={Boolean(placed) && placed !== option.id}
              accepted={placed === option.id}
              rejected={rejected.includes(option.id)}
              topSlot={topSlot}
              bottomSlot={bottomSlot}
              onAim={setAim}
              onMiss={() => miss(option.id)}
              onDrop={choose}
              ariaLabel={t("dropChoice", { number: choice + 1, name: t(option.nameKey) })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function slotClass(hot: boolean) {
  return cn(
    "absolute inset-x-4 flex h-11 items-center justify-center rounded-2xl border-2 border-dashed border-blue-600/35 bg-white/40",
    hot && "border-solid border-blue-600 bg-blue-50 shadow-[0_0_0_6px_rgba(37,99,235,0.16)]",
  );
}

function slotCenter(slot: HTMLDivElement | null) {
  if (!slot) {
    return null;
  }
  const rect = slot.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function VowelChip({
  option,
  index,
  locked,
  dimmed,
  accepted,
  rejected,
  topSlot,
  bottomSlot,
  onAim,
  onMiss,
  onDrop,
  ariaLabel,
}: {
  option: NikudDropOption;
  index: number;
  locked: boolean;
  dimmed: boolean;
  accepted: boolean;
  rejected: boolean;
  topSlot: RefObject<HTMLDivElement | null>;
  bottomSlot: RefObject<HTMLDivElement | null>;
  onAim: (slot: NikudSlot | null) => void;
  onMiss: () => void;
  onDrop: (id: string) => boolean;
  ariaLabel: string;
}) {
  const slot = nikudSlot(option.id);
  const ghostX = useMotionValue(0);
  const ghostY = useMotionValue(0);
  const cardRef = useRef<HTMLButtonElement>(null);
  const settled = useRef(false);
  const active = useRef(false);
  const [image, setImage] = useState<NikudImage | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void rasterNikud(option.mark, option.tail).then((next) => {
      if (!cancelled) {
        setImage(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [option.mark, option.tail]);

  function centerFor(name: NikudSlot) {
    return slotCenter(name === "top" ? topSlot.current : bottomSlot.current);
  }

  function offsets() {
    const size = inkSize(image);
    return { x: size.width / 2, y: size.height / 2 };
  }

  function springHome() {
    const card = cardRef.current?.getBoundingClientRect();
    if (!card) {
      setDragging(false);
      return;
    }
    const offset = offsets();
    const x = card.left + card.width / 2 - offset.x;
    const y = card.top + card.height / 2 - offset.y;
    const xAnim = animate(ghostX, x, homeSpring);
    const yAnim = animate(ghostY, y, homeSpring);
    void Promise.all([xAnim, yAnim]).finally(() => setDragging(false));
  }

  function lockOnto(center: { x: number; y: number }) {
    active.current = false;
    settled.current = true;
    onAim(null);
    const offset = offsets();
    const xAnim = animate(ghostX, center.x - offset.x, { type: "spring", bounce: 0.18, visualDuration: 0.16 });
    const yAnim = animate(ghostY, center.y - offset.y, { type: "spring", bounce: 0.18, visualDuration: 0.16 });
    void Promise.all([xAnim, yAnim]).finally(() => {
      const acceptedDrop = onDrop(option.id);
      if (!acceptedDrop) {
        settled.current = false;
        springHome();
        return;
      }
      setDragging(false);
    });
  }

  function placeAt(clientX: number, clientY: number) {
    const own = centerFor(slot);
    if (!own) {
      const offset = offsets();
      ghostX.set(clientX - offset.x);
      ghostY.set(clientY - offset.y);
      return;
    }
    const dx = clientX - own.x;
    const dy = clientY - own.y;
    const dist = Math.hypot(dx, dy);
    if (dist < lockDistance) {
      lockOnto(own);
      return;
    }
    let x = clientX;
    let y = clientY;
    if (dist < attractDistance) {
      const pull = ((attractDistance - dist) / attractDistance) * 0.72;
      x = clientX - dx * pull;
      y = clientY - dy * pull;
    }
    const offset = offsets();
    ghostX.set(x - offset.x);
    ghostY.set(y - offset.y);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (locked || !image) {
      return;
    }
    event.preventDefault();
    active.current = true;
    settled.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    onAim(slot);
    const offset = offsets();
    ghostX.set(event.clientX - offset.x);
    ghostY.set(event.clientY - offset.y);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!active.current || settled.current) {
      return;
    }
    placeAt(event.clientX, event.clientY);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!active.current || settled.current) {
      return;
    }
    active.current = false;
    onAim(null);
    const own = centerFor(slot);
    const other = centerFor(slot === "top" ? "bottom" : "top");
    const ownDist = own ? Math.hypot(event.clientX - own.x, event.clientY - own.y) : Number.POSITIVE_INFINITY;
    const otherDist = other ? Math.hypot(event.clientX - other.x, event.clientY - other.y) : Number.POSITIVE_INFINITY;
    if (own && ownDist < lockDistance + 16) {
      lockOnto(own);
      return;
    }
    if (otherDist < lockDistance + 16) {
      onMiss();
    }
    springHome();
  }

  const size = inkSize(image);

  return (
    <div className={cn("flex flex-col items-center gap-2", dimmed && "opacity-45")}>
      <motion.button
        ref={cardRef}
        type="button"
        animate={accepted ? { scale: [1, 1.08, 1] } : rejected ? { x: [0, -6, 6, -3, 0] } : { scale: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "flex h-24 w-24 cursor-grab touch-none items-center justify-center rounded-3xl border border-emerald-950/10 bg-white shadow-[0_18px_40px_-28px_rgba(6,78,59,0.8)] outline-none select-none focus-visible:ring-3 focus-visible:ring-emerald-700/30 active:cursor-grabbing",
          rejected && "border-red-600! bg-red-200!",
          accepted && "border-green-600! bg-green-200!",
          (accepted || locked) && "pointer-events-none",
        )}
        aria-label={ariaLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {image ? (
          <img
            src={image.url}
            alt=""
            draggable={false}
            width={size.width}
            height={size.height}
            className={dragging ? "opacity-0" : undefined}
            style={{ width: size.width, height: size.height }}
          />
        ) : null}
      </motion.button>
      <span className="flex size-6 items-center justify-center rounded-full bg-emerald-800 text-xs font-semibold text-white">{index + 1}</span>
      {dragging && image
        ? createPortal(
            <motion.img
              src={image.url}
              alt=""
              draggable={false}
              width={size.width}
              height={size.height}
              className="pointer-events-none fixed top-0 left-0 z-50"
              style={{ x: ghostX, y: ghostY, width: size.width, height: size.height, willChange: "transform" }}
            />,
            document.body,
          )
        : null}
    </div>
  );
}

function beginPrompt(
  prompt: SpeechCue,
  playRef: RefObject<(cue: SpeechCue) => void | Promise<void>>,
  setReady: (ready: boolean) => void,
  generation: RefObject<number>,
  armTimer: RefObject<number | null>,
) {
  const id = generation.current + 1;
  generation.current = id;
  setReady(false);
  armAfterSpeech(
    () => playRef.current(prompt),
    armTimer,
    () => setReady(true),
    () => generation.current === id,
  );
}
