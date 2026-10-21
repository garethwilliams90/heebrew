"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Info, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Popover } from "radix-ui";
import { LetterDialog } from "@/components/alephbet/letter-dialog";
import { letterCells, LetterCard } from "@/components/alephbet/letter-card";
import { LetterStudy } from "@/components/alephbet/letter-study";
import { useSoundPrefs } from "@/components/flashcards/sound-toggle";
import { Button } from "@/components/ui/button";
import { letterDeckId, spokenNames } from "@/lib/alephbet/letters";
import { loadDeckMastery } from "@/lib/flashcards/progress";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { playAudio } from "@/lib/settings/master-volume";

const scrimFade = { duration: 0.2, ease: "easeOut" as const };

export function AlephBetSession() {
  const t = useTranslations("AlephBet");
  const flashcards = useTranslations("Flashcards");
  const { prefs, prefsRef, setChannel } = useSoundPrefs();
  const clips = useRef(new Map<string, HTMLAudioElement>());
  const pendingLetter = useRef<string | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [studying, setStudying] = useState(false);
  const [flippedLetters, setFlippedLetters] = useState<ReadonlySet<string>>(() => new Set());
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const [openLetter, setOpenLetter] = useState<string | null>(null);
  const soundOn = prefs.general;
  const allFlipped = letterCells.every((cell) => flippedLetters.has(cell.fact.letter));
  const openCell = letterCells.find((cell) => cell.fact.letter === openLetter) ?? null;

  const closeLetter = useCallback(() => {
    setOpenLetter(null);
    returnFocus.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (studying) {
      return;
    }

    let current = true;
    loadDeckMastery(letterDeckId)
      .then((loaded) => {
        if (current) {
          setMastery(loaded.mastery);
        }
      })
      .catch(() => {
        if (current) {
          setMastery({});
        }
      });

    return () => {
      current = false;
    };
  }, [studying]);

  useEffect(() => {
    if (!openLetter) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeLetter();
    }

    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [closeLetter, openLetter]);

  function stopClips() {
    for (const clip of clips.current.values()) {
      clip.pause();
      clip.currentTime = 0;
    }
  }

  function playLoaded(letter: string) {
    const name = spokenNames[letter];
    const audio = name ? clips.current.get(name) : undefined;
    if (!audio || !prefsRef.current.general || pendingLetter.current !== letter) {
      return;
    }

    stopClips();
    pendingLetter.current = null;
    setFailed(false);
    void playAudio(audio).catch(() => {
      setFailed(true);
    });
  }

  function playLetter(letter: string) {
    if (!prefsRef.current.general) {
      return;
    }

    const name = spokenNames[letter];
    if (!name) {
      return;
    }

    pendingLetter.current = letter;
    setFailed(false);

    if (clips.current.has(name)) {
      playLoaded(letter);
      return;
    }

    void loadSpeechClip(name).then((audio) => {
      if (!audio) {
        if (pendingLetter.current === letter) {
          pendingLetter.current = null;
          setFailed(true);
        }
        return;
      }

      clips.current.set(name, audio);
      playLoaded(letter);
    });
  }

  function toggleSound() {
    const next = !prefsRef.current.general;
    if (!next) {
      pendingLetter.current = null;
      stopClips();
    }
    setChannel("general", next);
  }

  function flipAll() {
    setFlippedLetters(allFlipped ? new Set() : new Set(letterCells.map((cell) => cell.fact.letter)));
  }

  function openCard(letter: string, element: HTMLElement) {
    returnFocus.current = element;
    setOpenLetter(letter);
    playLetter(letter);
  }

  if (studying) {
    return <LetterStudy onClose={() => setStudying(false)} />;
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-10 sm:px-8">
      <div className="w-full max-w-[88rem]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-pressed={soundOn}
            aria-label={soundOn ? flashcards("muteSound") : flashcards("unmuteSound")}
            onClick={toggleSound}
          >
            {soundOn ? <Volume2 /> : <VolumeX />}
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              aria-pressed={allFlipped}
              className="rounded-r-none! border-r-0 pr-3"
              onClick={flipAll}
            >
              {allFlipped ? t("flipBack") : t("flipAll")}
            </Button>
            <Popover.Root>
              <Popover.Trigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label={t("scriptInfoLabel")}
                  className="rounded-l-none!"
                >
                  <Info />
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="bottom"
                  align="end"
                  sideOffset={8}
                  collisionPadding={16}
                  className="z-50 w-72 rounded-xl border border-foreground/10 bg-card p-3 text-sm leading-relaxed text-card-foreground shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)] outline-none"
                >
                  <p className="font-medium">{t("scriptInfoTitle")}</p>
                  <p className="mt-1 text-muted-foreground">{t("scriptInfo")}</p>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={() => {
              setOpenLetter(null);
              setStudying(true);
            }}
          >
            {t("studyLetters")}
          </Button>
        </div>
        {failed ? (
          <p className="mt-3 text-sm text-red-800" role="alert">
            {flashcards("speechError")}
          </p>
        ) : null}
        <div className="mt-4 grid w-full grid-cols-3 md:grid-cols-5">
          {letterCells.map((cell) => (
            <LetterCard
              key={cell.fact.letter}
              cell={cell}
              flipped={flippedLetters.has(cell.fact.letter)}
              mastery={mastery[cell.fact.letter] ?? 0}
              expanded={openLetter === cell.fact.letter}
              onOpen={(element) => openCard(cell.fact.letter, element)}
            />
          ))}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {openCell ? (
          <motion.div
            key="letter-scrim"
            role="presentation"
            className="fixed inset-0 z-40 bg-emerald-950/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={scrimFade}
            onMouseDown={(event) => event.preventDefault()}
            onClick={closeLetter}
          />
        ) : null}
      </AnimatePresence>
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
        <AnimatePresence initial={false}>
          {openCell ? (
            <LetterDialog
              key={openCell.fact.letter}
              fact={openCell.fact}
              mastery={mastery[openCell.fact.letter] ?? 0}
              cursive={flippedLetters.has(openCell.fact.letter)}
              soundOn={soundOn}
              onClose={closeLetter}
              onPlay={playLetter}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
