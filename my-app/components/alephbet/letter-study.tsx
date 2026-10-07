"use client";

import { useEffect, useRef, useState } from "react";
import { ProgramLoader } from "@/components/program-loader";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { cursiveFont } from "@/components/alephbet/cursive-font";
import { AccountNotice } from "@/components/flashcards/account-notice";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { SoundControls, useSoundPrefs, type SoundChannel } from "@/components/flashcards/sound-toggle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { letterDeckId, letterList, shuffleLetters, spokenNames, type StudyLetter } from "@/lib/alephbet/letters";
import { prepareSpeechClip, requestDeckSpeech } from "@/lib/flashcards/deck-speech";
import { loadDeckMastery, saveSessionProgress } from "@/lib/flashcards/progress";
import { nextMastery } from "@/lib/flashcards/review";

type StudyCard = StudyLetter & { mastery: number };
type Phase = "setup" | "study" | "done";

export function LetterStudy({ onClose }: { onClose: () => void }) {
  const t = useTranslations("AlephBet");
  const flashcards = useTranslations("Flashcards");
  const sound = useSoundPrefs();
  const [phase, setPhase] = useState<Phase>("setup");
  const [cursive, setCursive] = useState(false);
  const [queue, setQueue] = useState<StudyCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ready, setReady] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [speechError, setSpeechError] = useState(false);
  const masteryRef = useRef<Record<string, number>>({});
  const updatesRef = useRef(new Map<string, { mastery: number; practices: number }>());
  const phaseRef = useRef<Phase>("setup");
  const flippedRef = useRef(false);
  const savedRef = useRef(false);
  const savingRef = useRef<Promise<void> | null>(null);
  const gradeRef = useRef<(known: boolean) => void>(() => {});
  const flipRef = useRef<() => void>(() => {});
  const clips = useRef(new Map<string, HTMLAudioElement>());
  const clipUrls = useRef<string[]>([]);
  const soundsRef = useRef<Promise<void> | null>(null);
  const card = queue[index];
  const cardRef = useRef(card);
  cardRef.current = card;

  phaseRef.current = phase;
  flippedRef.current = flipped;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (phaseRef.current !== "study") {
        return;
      }

      const target = event.target;
      const inField =
        target instanceof HTMLElement && Boolean(target.closest("a, input, textarea, select"));

      if (event.key === " " || event.code === "Space") {
        if (inField || (target instanceof HTMLElement && target.closest("button, [role='button']"))) {
          return;
        }

        event.preventDefault();
        flipRef.current();
        return;
      }

      if (inField || !flippedRef.current) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        gradeRef.current(false);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        gradeRef.current(true);
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
      void persist();
    };
  }, []);

  function stopClip() {
    for (const clip of clips.current.values()) {
      clip.pause();
      clip.currentTime = 0;
    }
  }

  function loadLetterSounds() {
    if (soundsRef.current) {
      return soundsRef.current;
    }

    const names = [
      ...new Set(letterList().map((item) => spokenNames[item.letter]).filter((name) => name.length > 0)),
    ];

    const request = requestDeckSpeech(names)
      .then(async (clipsForDeck) => {
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
      })
      .catch((error: unknown) => {
        soundsRef.current = null;
        throw error;
      });

    soundsRef.current = request;
    return request;
  }

  function playName(letter: string) {
    const name = spokenNames[letter];
    if (!name || !sound.allows("word")) {
      return;
    }

    const audio = clips.current.get(name);
    if (!audio) {
      setSpeechError(true);
      return;
    }

    stopClip();
    setSpeechError(false);
    void audio.play().catch(() => {
      if (flippedRef.current && cardRef.current?.letter === letter) {
        setSpeechError(true);
      }
    });
  }

  function flip() {
    const next = !flippedRef.current;
    flippedRef.current = next;
    setFlipped(next);
    setSpeechError(false);

    const letter = cardRef.current?.letter;
    if (next && letter) {
      playName(letter);
      return;
    }

    stopClip();
  }

  flipRef.current = flip;

  function grade(known: boolean) {
    if (!flippedRef.current || !card) {
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    stopClip();

    const mastery = nextMastery(card.mastery, known ? "know" : "dontKnow");
    const previous = updatesRef.current.get(card.letter);
    updatesRef.current.set(card.letter, {
      mastery,
      practices: (previous?.practices ?? 0) + 1,
    });
    masteryRef.current = { ...masteryRef.current, [card.letter]: mastery };
    savedRef.current = false;
    flippedRef.current = false;
    setFlipped(false);

    if (index + 1 < queue.length) {
      setIndex(index + 1);
      return;
    }

    phaseRef.current = "done";
    setPhase("done");
    void persist();
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

    const request = saveSessionProgress(letterDeckId, updates).then((result) => {
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

  async function start() {
    if (clips.current.size === 0) {
      setReady(false);
    }

    setSpeechError(false);
    setPhase("study");
    phaseRef.current = "study";
    setIndex(0);
    setFlipped(false);
    flippedRef.current = false;

    let mastery = masteryRef.current;

    await Promise.all([
      loadDeckMastery(letterDeckId)
        .then((loaded) => {
          mastery = { ...masteryRef.current, ...loaded.mastery };
          masteryRef.current = mastery;
          setSignedOut(!loaded.signedIn);
          setSaveError(false);
        })
        .catch(() => {
          setSaveError(true);
        }),
      loadLetterSounds().catch(() => {
        setSpeechError(true);
      }),
    ]);

    setQueue(
      shuffleLetters(letterList()).map((item) => ({
        ...item,
        mastery: mastery[item.letter] ?? 0,
      })),
    );
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
      <main className="flex flex-1 flex-col items-center px-4 pb-10 sm:px-8">
        <div className="w-full max-w-xl">
          <h1 className="text-4xl font-bold">{t("studyTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("studySetup")}</p>
          <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-card p-4">
            <div>
              <p className="font-medium">{t("cursiveSetting")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("cursiveSettingHint")}</p>
            </div>
            <Switch
              checked={cursive}
              onCheckedChange={setCursive}
              aria-label={t("cursiveSetting")}
            />
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Button type="button" size="lg" onClick={() => void start()}>
              {t("start")}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={onClose}>
              {t("backToAlphabet")}
            </Button>
          </div>
        </div>
      </main>
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
        <div className="mb-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>{ready ? progress : t("studyTitle")}</p>
          <Button type="button" variant="ghost" size="sm" onClick={() => void leave()}>
            {t("backToAlphabet")}
          </Button>
        </div>
        <AccountNotice signedOut={signedOut} saveError={saveError} />
        {!ready ? (
          <ProgramLoader label={t("loadingSounds")} />
        ) : card ? (
          <>
            <div className="mb-4">
              <SoundControls prefs={sound.prefs} onToggle={toggleSound} />
            </div>
            <ProgressMeter
              className="mb-6 h-1.5 overflow-hidden rounded-full bg-emerald-950/10"
              label={progress}
              value={index + 1}
              max={queue.length}
              ratio={Math.round(((index + 1) / queue.length) * 100)}
            />
            <div className="perspective-distant">
              {/* A new letter mounts face-up, so the previous flip does not spin the answer into view. */}
              <div
                key={card.letter}
                role="button"
                tabIndex={0}
                aria-pressed={flipped}
                aria-label={flipped ? card.name : t("letterPrompt")}
                onClick={flip}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    flip();
                  }
                }}
                className={cn(
                  "relative h-80 transform-3d cursor-pointer rounded-[2rem] outline-none transition-transform duration-500 motion-reduce:transition-none focus-visible:outline-none sm:h-96",
                  flipped && "transform-[rotateY(180deg)]",
                )}
              >
                <StudyFace hidden={flipped}>
                  <LetterGlyph letter={card.letter} cursive={cursive} />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {flashcards("mastery", { level: card.mastery })}
                  </p>
                </StudyFace>
                <StudyFace hidden={!flipped} className="transform-[rotateY(180deg)]">
                  <p className="text-5xl font-semibold tracking-tight sm:text-6xl">{card.name}</p>
                </StudyFace>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">{flashcards("flipHint")}</p>
            {speechError ? (
              <p className="mt-2 text-center text-sm text-red-800" role="alert">
                {flashcards("speechError")}
              </p>
            ) : null}
            <div
              className={cn(
                "mt-4 grid grid-cols-2 gap-2 transition-opacity duration-300",
                flipped ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12"
                aria-keyshortcuts="ArrowLeft"
                disabled={!flipped}
                onClick={() => grade(false)}
              >
                {flashcards("dontKnow")}
              </Button>
              <Button
                type="button"
                size="lg"
                className="h-12"
                aria-keyshortcuts="ArrowRight"
                disabled={!flipped}
                onClick={() => grade(true)}
              >
                {flashcards("know")}
              </Button>
            </div>
            <p className="mt-3 text-center text-sm text-muted-foreground">{t("arrowHint")}</p>
          </>
        ) : null}
      </div>
    </main>
  );
}

function StudyFace({
  hidden,
  className,
  children,
}: {
  hidden: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-foreground/10 bg-card px-8 text-center shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)] backface-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

function LetterGlyph({ letter, cursive }: { letter: string; cursive: boolean }) {
  return (
    <span
      dir="rtl"
      lang="he"
      className={cn(
        "leading-none",
        cursive ? cn("text-8xl sm:text-9xl", cursiveFont.className) : "text-8xl font-bold sm:text-9xl",
      )}
    >
      {letter}
    </span>
  );
}
