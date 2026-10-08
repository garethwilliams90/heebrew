"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Popover } from "radix-ui";
import { cn } from "cn";
import { cursiveFont } from "@/components/alephbet/cursive-font";
import { LetterStudy } from "@/components/alephbet/letter-study";
import { useSoundPrefs } from "@/components/flashcards/sound-toggle";
import { Button } from "@/components/ui/button";
import { letterDeckId, letters, spokenNames } from "@/lib/alephbet/letters";
import { loadDeckMastery } from "@/lib/flashcards/progress";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { Progress } from "@/components/ui/progress";

const columns = { mobile: 3, desktop: 5 } as const;
const maxMastery = 6;

type Join = "start" | "end" | null;
type Side = "right" | "below";

type Cell = {
  letter: string;
  phonetic: string;
  index: number;
  join: Join;
};

// Sofit forms stay in dictionary order and occupy the next slot. The pair is marked so those two slots can share a seam.
function letterCells(): Cell[] {
  const cells: Cell[] = [];

  for (const [letter, phonetic] of Object.entries(letters)) {
    if (phonetic.endsWith(" sofit")) {
      const name = phonetic.slice(0, -" sofit".length);
      const partner = [...cells].reverse().find((cell) => cell.phonetic === name && cell.join === null);
      if (partner) {
        partner.join = "start";
        cells.push({ letter, phonetic, index: cells.length, join: "end" });
        continue;
      }
    }

    cells.push({ letter, phonetic, index: cells.length, join: null });
  }

  return cells;
}

const cells = letterCells();

// The shared edge depends on the column count: beside each other, or stacked when a pair lands in one column.
function sharedSide(index: number, columnCount: number): Side | null {
  const column = index % columnCount;
  const nextColumn = (index + 1) % columnCount;
  const row = Math.floor(index / columnCount);
  const nextRow = Math.floor((index + 1) / columnCount);

  if (nextRow === row && nextColumn === column + 1) return "right";
  if (nextRow === row + 1 && nextColumn === column) return "below";
  return null;
}

// Full class strings so Tailwind can see them. Position and corner radius stay separate so both faces of a flip can share the seam.
function placement(index: number, join: Join): { position: string; shape: string } {
  if (!join) return { position: "inset-2", shape: "rounded-xl border" };

  const partner = join === "end" ? index - 1 : index;
  const mobile = box(sharedSide(partner, columns.mobile), join, "max-md");
  const desktop = box(sharedSide(partner, columns.desktop), join, "md");
  return {
    position: cn(mobile.position, desktop.position),
    shape: cn(mobile.shape, desktop.shape),
  };
}

function box(side: Side | null, join: "start" | "end", breakpoint: "max-md" | "md"): { position: string; shape: string } {
  if (breakpoint === "max-md") {
    if (join === "start" && side === "right") {
      return {
        position: "max-md:top-2 max-md:right-0 max-md:bottom-2 max-md:left-2",
        shape: "max-md:rounded-l-xl max-md:rounded-r-none max-md:border",
      };
    }
    if (join === "end" && side === "right") {
      return {
        position: "max-md:top-2 max-md:right-2 max-md:bottom-2 max-md:left-0",
        shape: "max-md:rounded-r-xl max-md:rounded-l-none max-md:border max-md:border-l-0",
      };
    }
    if (join === "start" && side === "below") {
      return {
        position: "max-md:top-2 max-md:right-2 max-md:bottom-0 max-md:left-2",
        shape: "max-md:rounded-t-xl max-md:rounded-b-none max-md:border",
      };
    }
    if (join === "end" && side === "below") {
      return {
        position: "max-md:top-0 max-md:right-2 max-md:bottom-2 max-md:left-2",
        shape: "max-md:rounded-b-xl max-md:rounded-t-none max-md:border max-md:border-t-0",
      };
    }
    return { position: "max-md:inset-2", shape: "max-md:rounded-xl max-md:border" };
  }

  if (join === "start" && side === "right") {
    return {
      position: "md:top-2 md:right-0 md:bottom-2 md:left-2",
      shape: "md:rounded-l-xl md:rounded-r-none md:border",
    };
  }
  if (join === "end" && side === "right") {
    return {
      position: "md:top-2 md:right-2 md:bottom-2 md:left-0",
      shape: "md:rounded-r-xl md:rounded-l-none md:border md:border-l-0",
    };
  }
  if (join === "start" && side === "below") {
    return {
      position: "md:top-2 md:right-2 md:bottom-0 md:left-2",
      shape: "md:rounded-t-xl md:rounded-b-none md:border",
    };
  }
  if (join === "end" && side === "below") {
    return {
      position: "md:top-0 md:right-2 md:bottom-2 md:left-2",
      shape: "md:rounded-b-xl md:rounded-t-none md:border md:border-t-0",
    };
  }
  return { position: "md:inset-2", shape: "md:rounded-xl md:border" };
}

export function AlephBetSession() {
  const t = useTranslations("AlephBet");
  const flashcards = useTranslations("Flashcards");
  const { prefs, prefsRef, setChannel } = useSoundPrefs();
  const clips = useRef(new Map<string, HTMLAudioElement>());
  const pendingLetter = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [studying, setStudying] = useState(false);
  const [flippedLetters, setFlippedLetters] = useState<ReadonlySet<string>>(() => new Set());
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const soundOn = prefs.general;
  const allFlipped = cells.every((cell) => flippedLetters.has(cell.letter));

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
    void audio.play().catch(() => {
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

  function toggleLetter(letter: string) {
    setFlippedLetters((current) => {
      const next = new Set(current);
      if (next.has(letter)) next.delete(letter);
      else next.add(letter);
      return next;
    });
  }

  function flipAll() {
    setFlippedLetters(allFlipped ? new Set() : new Set(cells.map((cell) => cell.letter)));
  }

  if (studying) {
    return <LetterStudy onClose={() => setStudying(false)} />;
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-10 sm:px-8">
      <div className="flex w-full max-w-3xl items-start justify-between gap-4">
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
      <div className="mt-4 flex w-full max-w-3xl flex-wrap items-center justify-between gap-2">
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
        <Button type="button" size="lg" onClick={() => setStudying(true)}>
          {t("studyLetters")}
        </Button>
      </div>
      {failed ? (
        <p className="mt-3 text-sm text-red-800" role="alert">
          {flashcards("speechError")}
        </p>
      ) : null}
      <div className="mt-4 grid w-full max-w-3xl grid-cols-3 md:grid-cols-5">
        {cells.map((cell) => (
          <AlephBetCard
            key={cell.letter}
            {...cell}
            flipped={flippedLetters.has(cell.letter)}
            mastery={mastery[cell.letter] ?? 0}
            onFlip={() => toggleLetter(cell.letter)}
            onPlay={playLetter}
          />
        ))}
      </div>
    </main>
  );
}

function AlephBetCard({
  letter,
  phonetic,
  index,
  join,
  flipped,
  mastery,
  onFlip,
  onPlay,
}: Cell & { flipped: boolean; mastery: number; onFlip: () => void; onPlay: (letter: string) => void }) {
  const flashcards = useTranslations("Flashcards");
  const { position, shape } = placement(index, join);
  const masteryLabel = flashcards("mastery", { level: mastery });

  function activate() {
    onFlip();
    onPlay(letter);
  }

  return (
    <div className={cn("group/letter relative aspect-square min-w-0 hover:z-10", flipped && "z-10")}>
      <div className={cn("absolute perspective-distant", position)}>
        <button
          type="button"
          aria-pressed={flipped}
          aria-label={`${phonetic}, ${masteryLabel}`}
          onClick={activate}
          className={cn(
            "relative h-full w-full transform-3d cursor-pointer border-0 bg-transparent p-0 transition-transform duration-500 motion-reduce:transition-none",
            flipped && "transform-[rotateY(180deg)]",
          )}
        >
          <LetterSide className={shape}>
            <LetterFace letter={letter} phonetic={phonetic} />
          </LetterSide>
          <LetterSide className={cn("transform-[rotateY(180deg)]", shape)}>
            <LetterFace letter={letter} phonetic={phonetic} cursive />
          </LetterSide>
        </button>
        <Progress
          value={(mastery / maxMastery) * 100}
          aria-hidden
          className="pointer-events-none absolute inset-x-3 bottom-2 z-10 h-1 w-auto bg-emerald-950/10"
        />
      </div>
    </div>
  );
}

function LetterSide({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center border-foreground/10 bg-card px-1 text-center shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)] backface-hidden transition-colors group-hover/letter:bg-emerald-50",
        className,
      )}
    >
      {children}
    </div>
  );
}

function LetterFace({ letter, phonetic, cursive = false }: { letter: string; phonetic: string; cursive?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <span
        dir="rtl"
        lang="he"
        className={cn(
          "leading-none",
          cursive ? cn("text-5xl sm:text-6xl", cursiveFont.className) : "text-3xl font-bold sm:text-4xl",
        )}
      >
        {letter}
      </span>
      <span className="text-center text-xs leading-tight text-muted-foreground">{phonetic}</span>
    </div>
  );
}
