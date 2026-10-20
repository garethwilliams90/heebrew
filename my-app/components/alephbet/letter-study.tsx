"use client";

import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cursiveFont } from "@/components/alephbet/cursive-font";
import { printFont } from "@/components/alephbet/print-font";
import { LetterStudySetup, type PracticeKind, type ScriptChoice } from "@/components/alephbet/letter-study-setup";
import { ProgramLoader } from "@/components/program-loader";
import { AccountNotice } from "@/components/flashcards/account-notice";
import { MasteryRing } from "@/components/flashcards/mastery-ring";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { useSoundPrefs, type SoundChannel } from "@/components/flashcards/sound-toggle";
import { CardFace, SwipeCard, type SwipeDirection } from "@/components/flashcards/swipe-card";
import { StudyTools } from "@/components/flashcards/study-tools";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import {
  LETTER_STUDY_DEFAULT,
  letterDeckId,
  letterList,
  shuffleLetters,
  spokenNames,
  takeForPractice,
} from "@/lib/alephbet/letters";
import { nikudDeck, nikudDeckId } from "@/lib/alephbet/nikud-deck";
import { prepareSpeechClip, requestDeckSpeech } from "@/lib/flashcards/deck-speech";
import { loadDeckMastery, saveSessionProgress } from "@/lib/flashcards/progress";
import { nextMastery } from "@/lib/flashcards/review";

type Phase = "setup" | "study" | "done";

type PracticeCard = {
  id: string;
  prompt: string;
  cursive: boolean;
  answer: string;
  vowel: string | null;
  speak: string;
  mastery: number;
};

export function LetterStudy({ onClose }: { onClose: () => void }) {
  const t = useTranslations("AlephBet");
  const flashcards = useTranslations("Flashcards");
  const sound = useSoundPrefs();
  const [phase, setPhase] = useState<Phase>("setup");
  const [kind, setKind] = useState<PracticeKind>("letters");
  const [script, setScript] = useState<ScriptChoice>("print");
  const [count, setCount] = useState(LETTER_STUDY_DEFAULT);
  const [queue, setQueue] = useState<PracticeCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<SwipeDirection>(1);
  const [ready, setReady] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [speechError, setSpeechError] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [replayOn, setReplayOn] = useState(false);
  const masteryRef = useRef<Record<string, number>>({});
  const updatesRef = useRef(new Map<string, { mastery: number; practices: number }>());
  const deckRef = useRef(letterDeckId);
  const phaseRef = useRef<Phase>("setup");
  const flippedRef = useRef(false);
  const busyRef = useRef(false);
  const savedRef = useRef(false);
  const savingRef = useRef<Promise<void> | null>(null);
  const gradeRef = useRef<(known: boolean) => void>(() => {});
  const flipRef = useRef<() => void>(() => {});
  const replayRef = useRef<() => void>(() => {});
  const clips = useRef(new Map<string, HTMLAudioElement>());
  const clipUrls = useRef<string[]>([]);
  const replayTimer = useRef<number | null>(null);
  const doneTimer = useRef<number | null>(null);
  const card = queue[index];
  const cardRef = useRef(card);
  cardRef.current = card;

  phaseRef.current = phase;
  flippedRef.current = flipped;

  useEffect(() => {
    busyRef.current = false;
  }, [card?.id, index]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (phaseRef.current !== "study") {
        return;
      }

      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select")) {
        return;
      }

      if (event.repeat || busyRef.current) {
        return;
      }

      if (event.key === " " || event.code === "Space") {
        if (target instanceof HTMLElement && target.closest("button, a")) {
          return;
        }

        event.preventDefault();
        flipRef.current();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        gradeRef.current(false);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        gradeRef.current(true);
        return;
      }

      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        replayRef.current();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      stopClip();
      for (const url of clipUrls.current) {
        URL.revokeObjectURL(url);
      }
      if (replayTimer.current !== null) {
        window.clearTimeout(replayTimer.current);
      }
      if (doneTimer.current !== null) {
        window.clearTimeout(doneTimer.current);
      }
      void persist();
    };
  }, []);

  function stopClip() {
    for (const clip of clips.current.values()) {
      clip.pause();
      clip.currentTime = 0;
    }
    setSpeaking(false);
  }

  function playSpeak(text: string) {
    if (!sound.allows("word")) {
      return false;
    }

    const audio = clips.current.get(text);
    if (!audio) {
      setSpeechError(true);
      return false;
    }

    stopClip();
    setSpeechError(false);
    setSpeaking(true);
    void audio.play().catch(() => {
      if (cardRef.current?.speak === text) {
        setSpeechError(true);
      }
    });
    audio.onended = () => setSpeaking(false);
    return true;
  }

  async function loadSounds(texts: string[]) {
    const clipsForDeck = await requestDeckSpeech(texts);
    await Promise.all(
      clipsForDeck.map(async (clip) => {
        if (clips.current.has(clip.text)) {
          return;
        }

        const { url, audio } = await prepareSpeechClip(clip.audio);
        clipUrls.current.push(url);
        clips.current.set(clip.text, audio);
      }),
    );
  }

  function flip() {
    const next = !flippedRef.current;
    flippedRef.current = next;
    setFlipped(next);
    setSpeechError(false);

    const current = cardRef.current;
    if (next && current) {
      playSpeak(current.speak);
      return;
    }

    stopClip();
  }

  flipRef.current = flip;

  function replay() {
    const current = cardRef.current;
    if (!flippedRef.current || !current || !playSpeak(current.speak)) {
      return;
    }

    setReplayOn(true);
    if (replayTimer.current !== null) {
      window.clearTimeout(replayTimer.current);
    }
    replayTimer.current = window.setTimeout(() => setReplayOn(false), 450);
  }

  replayRef.current = replay;

  function grade(known: boolean) {
    const current = cardRef.current;
    if (!flippedRef.current || busyRef.current || !current) {
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    busyRef.current = true;
    setDirection(known ? 1 : -1);
    stopClip();

    const mastery = nextMastery(current.mastery, known ? "know" : "dontKnow");
    const previous = updatesRef.current.get(current.id);
    updatesRef.current.set(current.id, {
      mastery,
      practices: (previous?.practices ?? 0) + 1,
    });
    masteryRef.current = { ...masteryRef.current, [current.id]: mastery };
    savedRef.current = false;
    flippedRef.current = false;
    setFlipped(false);

    if (index + 1 < queue.length) {
      setIndex(index + 1);
      return;
    }

    setIndex(queue.length);
    if (doneTimer.current !== null) {
      window.clearTimeout(doneTimer.current);
    }
    doneTimer.current = window.setTimeout(() => {
      phaseRef.current = "done";
      setPhase("done");
      void persist();
    }, 340);
  }

  gradeRef.current = grade;

  function toggleSound(channel: SoundChannel) {
    const next = !sound.prefsRef.current[channel];
    sound.setChannel(channel, next);
    if (!next && (channel === "general" || channel === "word")) {
      stopClip();
    }
  }

  async function persist() {
    if (savedRef.current || updatesRef.current.size === 0) {
      return;
    }

    if (savingRef.current) {
      return savingRef.current;
    }

    const updates = [...updatesRef.current.entries()].map(([cardId, value]) => ({
      cardId,
      mastery: value.mastery,
      practices: value.practices,
    }));

    const request = saveSessionProgress(deckRef.current, updates).then((result) => {
      if (result === "error") {
        setSaveError(true);
        return;
      }

      savedRef.current = true;
      setSaveError(false);
      setSignedOut(result === "signed-out");
    });

    savingRef.current = request;

    try {
      await request;
    } finally {
      savingRef.current = null;
    }
  }

  function buildQueue(mastery: Record<string, number>): PracticeCard[] {
    if (kind === "nikud") {
      return takeForPractice(nikudDeck, mastery, count).map((item) => ({
        id: item.id,
        prompt: item.glyph,
        cursive: false,
        answer: item.sound,
        vowel: item.vowel,
        speak: item.glyph,
        mastery: mastery[item.id] ?? 0,
      }));
    }

    const letters = takeForPractice(
      letterList().map((item) => ({ ...item, id: item.letter })),
      mastery,
      count,
    );
    const cursiveFlags =
      script === "both"
        ? shuffleLetters(letters.map((_, itemIndex) => itemIndex % 2 === 0))
        : letters.map(() => script === "cursive");

    return letters.map((item, itemIndex) => ({
      id: item.letter,
      prompt: item.letter,
      cursive: cursiveFlags[itemIndex] ?? false,
      answer: item.name,
      vowel: null,
      speak: spokenNames[item.letter] ?? "",
      mastery: mastery[item.letter] ?? 0,
    }));
  }

  async function start() {
    const deckId = kind === "nikud" ? nikudDeckId : letterDeckId;
    if (deckRef.current !== deckId) {
      masteryRef.current = {};
      deckRef.current = deckId;
    }

    setSpeechError(false);
    setReady(false);
    setPhase("study");
    phaseRef.current = "study";
    setIndex(0);
    setFlipped(false);
    flippedRef.current = false;
    setDirection(1);

    let mastery = masteryRef.current;

    try {
      const loaded = await loadDeckMastery(deckId);
      mastery = { ...masteryRef.current, ...loaded.mastery };
      masteryRef.current = mastery;
      setSignedOut(!loaded.signedIn);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }

    const nextQueue = buildQueue(mastery);
    setQueue(nextQueue);

    try {
      await loadSounds(nextQueue.map((item) => item.speak));
    } catch {
      setSpeechError(true);
    }

    setReady(true);
  }

  async function studyAgain() {
    await persist();
    if (!savedRef.current && updatesRef.current.size > 0) {
      return;
    }

    updatesRef.current.clear();
    savedRef.current = false;
    await start();
  }

  async function leave() {
    await persist();
    onClose();
  }

  if (phase === "setup") {
    return (
      <LetterStudySetup
        kind={kind}
        script={script}
        count={count}
        letterTotal={letterList().length}
        nikudTotal={nikudDeck.length}
        onKind={setKind}
        onScript={setScript}
        onCount={setCount}
        onStart={() => void start()}
        onClose={onClose}
      />
    );
  }

  if (phase === "done") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-10 text-center sm:px-8">
        <AccountNotice signedOut={signedOut} saveError={saveError} />
        <h1 className="text-4xl font-bold">{flashcards("completeTitle")}</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{flashcards("completeBody")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button type="button" size="lg" onClick={() => void studyAgain()}>
            {flashcards("studyAgain")}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => void leave()}>
            {t("backToAlphabet")}
          </Button>
        </div>
      </main>
    );
  }

  const progress = flashcards("progress", { done: index + 1, total: Math.max(queue.length, 1) });

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-10 sm:px-8">
      <div className="flex w-full max-w-xl flex-1 flex-col justify-center">
        <div className="mb-4 flex items-center justify-between gap-4 text-sm text-emerald-900/70">
          <p>{ready && card ? progress : t("studyTitle")}</p>
          <div className="flex items-center gap-3">
            {card ? <MasteryRing level={card.mastery} /> : null}
            <Button type="button" variant="ghost" size="sm" onClick={() => void leave()}>
              {t("backToAlphabet")}
            </Button>
          </div>
        </div>
        <AccountNotice signedOut={signedOut} saveError={saveError} />
        {!ready ? (
          <ProgramLoader label={t("loadingSounds")} />
        ) : (
          <>
            <div className="mb-4">
              <StudyTools soundPrefs={sound.prefs} onToggleSound={toggleSound} tools={["word", "general"]} />
            </div>
            {card ? (
              <ProgressMeter
                className="mb-6 h-1.5 overflow-hidden rounded-full bg-emerald-950/10"
                label={progress}
                value={index + 1}
                max={queue.length}
                ratio={Math.round(((index + 1) / queue.length) * 100)}
                sections={queue.length}
              />
            ) : (
              <div className="mb-6 h-1.5" />
            )}
            <div className="relative h-80 w-full sm:h-96">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                {card ? (
                <SwipeCard key={`${card.id}:${index}`} flipped={flipped} onFlip={flip}>
                  <CardFace className={flipped ? "pointer-events-none" : ""}>
                    <Prompt card={card} label={card.cursive ? t("cursiveScript") : t("printScript")} />
                  </CardFace>
                  <CardFace className={`transform-[rotateY(180deg)] ${flipped ? "" : "pointer-events-none"}`}>
                    <span className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        className={`border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50 ${
                          replayOn ? "ring-2 ring-emerald-500" : ""
                        }`}
                        aria-keyshortcuts="R"
                        aria-label={speaking ? flashcards("listening") : flashcards("listen")}
                        disabled={!sound.prefs.general || !sound.prefs.word || speaking}
                        onClick={(event) => {
                          event.stopPropagation();
                          replay();
                        }}
                      >
                        <Volume2 />
                      </Button>
                      <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-emerald-800 text-[9px] font-semibold text-white">
                        R
                      </span>
                      {replayOn ? (
                        <motion.span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-600"
                          initial={{ opacity: 0.75, scale: 1 }}
                          animate={{ opacity: 0, scale: 1.5 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          style={{ willChange: "transform, opacity" }}
                        />
                      ) : null}
                    </span>
                    <p className="mt-4 text-5xl font-semibold tracking-tight text-emerald-950 sm:text-6xl">{card.answer}</p>
                    {card.vowel ? <p className="mt-3 text-lg text-emerald-900/70">{t(`vowels.${card.vowel}`)}</p> : null}
                  </CardFace>
                </SwipeCard>
                ) : null}
              </AnimatePresence>
            </div>
            <p className="mt-4 text-center text-sm text-emerald-900/60">{flashcards("flipHint")}</p>
            {speechError ? (
              <p className="mt-2 text-center text-sm text-red-800" role="alert">
                {flashcards("speechError")}
              </p>
            ) : null}
            <div className={`mt-4 grid grid-cols-2 gap-3 transition-opacity duration-200 ${flipped ? "opacity-100" : "pointer-events-none opacity-0"}`}>
              <Button
                type="button"
                variant="outline"
                className="h-14 border-red-200 bg-white text-red-800 hover:bg-red-50"
                aria-keyshortcuts="ArrowLeft"
                disabled={!flipped}
                onClick={() => grade(false)}
              >
                {flashcards("dontKnow")}
                <ArrowLeft className="size-5" strokeWidth={3} />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-14 border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50"
                aria-keyshortcuts="ArrowRight"
                disabled={!flipped}
                onClick={() => grade(true)}
              >
                {flashcards("know")}
                <ArrowRight className="size-5" strokeWidth={3} />
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Prompt({ card, label }: { card: PracticeCard; label: string }) {
  return (
    <>
      {card.vowel ? null : <p className="text-xs font-medium tracking-[0.16em] text-emerald-800/70 uppercase">{label}</p>}
      <span
        dir="rtl"
        lang="he"
        className={cn(
          "mt-4 leading-none text-emerald-950",
          card.cursive
            ? cn("text-8xl sm:text-9xl", cursiveFont.className)
            : cn("text-8xl font-bold sm:text-9xl", printFont.className),
        )}
      >
        {card.prompt}
      </span>
    </>
  );
}
