"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { animate, motion, useAnimation, useMotionValue } from "motion/react";
import { useCue } from "@/components/settings/use-cue";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { HeartRow, HintButton } from "@/components/learn/practice-hearts";
import { PointedLetter } from "@/components/learn/pointed-letter";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { Button } from "@/components/ui/button";
import { addExperience } from "@/lib/flashcards/experience";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { nikudDropRounds, nikudSlot, type NikudDropOption, type NikudSlot } from "@/lib/learn/nikud-drop";
import { rasterNikud, type NikudImage } from "@/lib/learn/nikud-raster";
import { nikudCue, type SpeechCue } from "@/lib/alephbet/intro-alphabet";

const lessonExperience = 6;
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
  onPlay,
  onPass,
}: {
  onPlay: (cue: SpeechCue) => void | Promise<void>;
  onPass: () => void;
}) {
  const t = useTranslations("Learn");
  const [rounds] = useState(() => nikudDropRounds());
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<string | null>(null);
  const [rejected, setRejected] = useState<string | null>(null);
  const [aim, setAim] = useState<NikudSlot | null>(null);
  const [ready, setReady] = useState(false);
  const [replayDown, setReplayDown] = useState(false);
  const [halves, setHalves] = useState(10);
  const [hidden, setHidden] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
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
          void addExperience(rounds.length * lessonExperience);
          passRef.current();
        }
        return next;
      });
    }, 880);

    return () => window.clearTimeout(timer);
  }, [placed, rounds.length]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea")) {
        return;
      }

      if (!round || placed || failed) {
        return;
      }

      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        if (event.type === "keyup") {
          setReplayDown(false);
          return;
        }
        if (event.repeat) {
          return;
        }
        setReplayDown(true);
        beginPrompt(round.prompt, playRef, setReady, generation, armTimer);
      }
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [round, placed, failed]);

  function loseHeart(cost: number) {
    setHalves((current) => {
      const next = Math.max(0, current - cost);
      if (next <= 0) {
        setFailed(true);
      }
      return next;
    });
  }

  function playThen(id: string, after: () => void) {
    const option = round?.options.find((item) => item.id === id);
    const cue = round && option ? nikudCue(round.letter, option.id) : null;
    void Promise.resolve(cue ? playRef.current(cue) : undefined).finally(after);
  }

  function choose(id: string) {
    if (!round || placed || !ready || failed || answering.current) {
      return false;
    }

    const correct = id === round.answerId;
    answering.current = true;
    playThen(id, () => {
      if (!correct) {
        playWrong();
        setRejected(id);
        loseHeart(2);
        window.setTimeout(() => {
          setRejected((value) => (value === id ? null : value));
          answering.current = false;
        }, 450);
        void zoneMotion.start({
          x: [0, -12, 12, -8, 8, 0],
          transition: { duration: 0.4, ease: "easeInOut" },
        });
        return;
      }

      playSuccess();
      setRejected(null);
      setHidden([]);
      setPlaced(id);
      answering.current = false;
    });
    return correct;
  }

  function miss(id: string) {
    if (placed || failed || answering.current) {
      return;
    }
    answering.current = true;
    playThen(id, () => {
      playWrong();
      loseHeart(2);
      answering.current = false;
      void zoneMotion.start({
        x: [0, -12, 12, -8, 8, 0],
        transition: { duration: 0.4, ease: "easeInOut" },
      });
    });
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
    setHalves(10);
    setHidden([]);
    setFailed(false);
    setPlaced(null);
    setRejected(null);
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
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3">
      <div className="flex w-full flex-col items-center gap-3">
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
          <HintButton
            disabled={failed || halves < 1 || round.options.filter((item) => item.id !== round.answerId && !hidden.includes(item.id)).length < 1}
            onHint={hint}
          />
        </div>
        <div className="text-center">
          <p className="text-base text-emerald-900/80 sm:text-lg">{failed ? t("outOfHearts") : t("dropSlots")}</p>
          <p className="mt-2 text-sm text-emerald-800">{t("quizProgress", { done: question, total: rounds.length })}</p>
        </div>
        {failed ? (
          <Button type="button" className="h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900" onClick={retry}>
            {t("tryAgain")}
          </Button>
        ) : null}
        <motion.span
          className="relative inline-flex"
          animate={{ scale: replayDown ? 0.96 : 1 }}
          transition={{ type: "spring", bounce: 0.05, visualDuration: 0.12 }}
        >
          <Button
            type="button"
            variant="outline"
            className="h-10 px-5"
            aria-keyshortcuts="R"
            onPointerDown={() => setReplayDown(true)}
            onPointerUp={() => setReplayDown(false)}
            onPointerLeave={() => setReplayDown(false)}
            sound={false}
            onClick={replay}
          >
            {t("quizHear")}
          </Button>
          <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-800 text-[10px] font-semibold text-white">
            R
          </span>
        </motion.span>
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
              locked={!ready || Boolean(placed) || failed}
              dimmed={Boolean(placed) && placed !== option.id}
              accepted={placed === option.id}
              rejected={rejected === option.id}
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
      <button
        ref={cardRef}
        type="button"
        className={cn(
          "flex h-24 w-24 cursor-grab touch-none items-center justify-center rounded-3xl border border-emerald-950/10 bg-white shadow-[0_18px_40px_-28px_rgba(6,78,59,0.8)] outline-none select-none focus-visible:ring-3 focus-visible:ring-emerald-700/30 active:cursor-grabbing",
          rejected && "border-red-300 bg-red-50",
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
      </button>
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
  if (armTimer.current !== null) {
    window.clearTimeout(armTimer.current);
    armTimer.current = null;
  }

  const started = Date.now();
  void Promise.resolve(playRef.current(prompt)).finally(() => {
    if (generation.current !== id) {
      return;
    }
    const wait = Math.max(0, 500 - (Date.now() - started));
    armTimer.current = window.setTimeout(() => {
      if (generation.current === id) {
        setReady(true);
      }
    }, wait);
  });
}
