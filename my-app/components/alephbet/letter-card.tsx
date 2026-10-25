"use client";

import { memo } from "react";
import { Info } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { cursiveFont } from "@/components/alephbet/cursive-font";
import { printFont } from "@/components/alephbet/print-font";
import { MasteryRing } from "@/components/flashcards/mastery-ring";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { letterCatalog, type LetterFact } from "@/lib/alephbet/letter-info";

const columns = { mobile: 3, desktop: 5 } as const;

type Join = "start" | "end" | null;
type Side = "right" | "below";

export type LetterCell = {
  fact: LetterFact;
  index: number;
  join: Join;
};

export const letterTransition = { type: "spring" as const, bounce: 0.12, visualDuration: 0.4 };

export const cardShadow = "0 24px 60px -32px rgba(6, 78, 59, 0.45)";

export function letterLayoutId(letter: string) {
  return `aleph-letter-${letter}`;
}

// Sofit forms stay in dictionary order and occupy the next slot. The pair is marked so those two slots can share a seam.
function buildLetterCells(): LetterCell[] {
  const cells: LetterCell[] = [];

  for (const fact of letterCatalog) {
    if (fact.name.endsWith(" sofit")) {
      const name = fact.name.slice(0, -" sofit".length);
      const partner = [...cells].reverse().find((cell) => cell.fact.name === name && cell.join === null);
      if (partner) {
        partner.join = "start";
        cells.push({ fact, index: cells.length, join: "end" });
        continue;
      }
    }

    cells.push({ fact, index: cells.length, join: null });
  }

  return cells;
}

export const letterCells = buildLetterCells();

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

type FaceBox = {
  position: string;
  radius: string;
  border: string;
  backRadius: string;
  backBorder: string;
};

// Full class strings so Tailwind can see them. Each face carries its own radius and border.
// A rotating face is flipped left-to-right, so a horizontal seam is mirrored on the back.
function placement(index: number, join: Join): FaceBox {
  if (!join) {
    return {
      position: "inset-2",
      radius: "rounded-xl",
      border: "border",
      backRadius: "rounded-xl",
      backBorder: "border",
    };
  }

  const partner = join === "end" ? index - 1 : index;
  const mobile = box(sharedSide(partner, columns.mobile), join, "max-md");
  const desktop = box(sharedSide(partner, columns.desktop), join, "md");
  return {
    position: cn(mobile.position, desktop.position),
    radius: cn(mobile.radius, desktop.radius),
    border: cn(mobile.border, desktop.border),
    backRadius: cn(mobile.backRadius, desktop.backRadius),
    backBorder: cn(mobile.backBorder, desktop.backBorder),
  };
}

function box(side: Side | null, join: "start" | "end", breakpoint: "max-md" | "md"): FaceBox {
  if (breakpoint === "max-md") {
    if (join === "start" && side === "right") {
      return {
        position: "max-md:top-2 max-md:right-0 max-md:bottom-2 max-md:left-2",
        radius: "max-md:rounded-l-xl max-md:rounded-r-none",
        border: "max-md:border",
        backRadius: "max-md:rounded-r-xl max-md:rounded-l-none",
        backBorder: "max-md:border",
      };
    }
    if (join === "end" && side === "right") {
      return {
        position: "max-md:top-2 max-md:right-2 max-md:bottom-2 max-md:left-0",
        radius: "max-md:rounded-r-xl max-md:rounded-l-none",
        border: "max-md:border max-md:border-l-0",
        backRadius: "max-md:rounded-l-xl max-md:rounded-r-none",
        backBorder: "max-md:border max-md:border-r-0",
      };
    }
    if (join === "start" && side === "below") {
      return {
        position: "max-md:top-2 max-md:right-2 max-md:bottom-0 max-md:left-2",
        radius: "max-md:rounded-t-xl max-md:rounded-b-none",
        border: "max-md:border",
        backRadius: "max-md:rounded-t-xl max-md:rounded-b-none",
        backBorder: "max-md:border",
      };
    }
    if (join === "end" && side === "below") {
      return {
        position: "max-md:top-0 max-md:right-2 max-md:bottom-2 max-md:left-2",
        radius: "max-md:rounded-b-xl max-md:rounded-t-none",
        border: "max-md:border max-md:border-t-0",
        backRadius: "max-md:rounded-b-xl max-md:rounded-t-none",
        backBorder: "max-md:border max-md:border-t-0",
      };
    }
    return {
      position: "max-md:inset-2",
      radius: "max-md:rounded-xl",
      border: "max-md:border",
      backRadius: "max-md:rounded-xl",
      backBorder: "max-md:border",
    };
  }

  if (join === "start" && side === "right") {
    return {
      position: "md:top-2 md:right-0 md:bottom-2 md:left-2",
      radius: "md:rounded-l-xl md:rounded-r-none",
      border: "md:border",
      backRadius: "md:rounded-r-xl md:rounded-l-none",
      backBorder: "md:border",
    };
  }
  if (join === "end" && side === "right") {
    return {
      position: "md:top-2 md:right-2 md:bottom-2 md:left-0",
      radius: "md:rounded-r-xl md:rounded-l-none",
      border: "md:border md:border-l-0",
      backRadius: "md:rounded-l-xl md:rounded-r-none",
      backBorder: "md:border md:border-r-0",
    };
  }
  if (join === "start" && side === "below") {
    return {
      position: "md:top-2 md:right-2 md:bottom-0 md:left-2",
      radius: "md:rounded-t-xl md:rounded-b-none",
      border: "md:border",
      backRadius: "md:rounded-t-xl md:rounded-b-none",
      backBorder: "md:border",
    };
  }
  if (join === "end" && side === "below") {
    return {
      position: "md:top-0 md:right-2 md:bottom-2 md:left-2",
      radius: "md:rounded-b-xl md:rounded-t-none",
      border: "md:border md:border-t-0",
      backRadius: "md:rounded-b-xl md:rounded-t-none",
      backBorder: "md:border md:border-t-0",
    };
  }
  return {
    position: "md:inset-2",
    radius: "md:rounded-xl",
    border: "md:border",
    backRadius: "md:rounded-xl",
    backBorder: "md:border",
  };
}

function keepOnCard(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

export const LetterCard = memo(function LetterCard({
  cell,
  flipped,
  mastery,
  expanded,
  onOpen,
}: {
  cell: LetterCell;
  flipped: boolean;
  mastery: number;
  expanded: boolean;
  onOpen: (element: HTMLElement) => void;
}) {
  const t = useTranslations("AlephBet");
  const { fact, index, join } = cell;
  const { position, radius, border, backRadius, backBorder } = placement(index, join);
  const faceStyle = join ? { boxShadow: cardShadow } : { borderRadius: 16, boxShadow: cardShadow };

  return (
    <div className={cn("relative aspect-square min-w-0", expanded ? "z-20" : "hover:z-10")}>
      <motion.div
        layoutId={letterLayoutId(fact.letter)}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        aria-label={`${fact.name}, ${fact.sound}`}
        transition={letterTransition}
        onClick={(event) => onOpen(event.currentTarget)}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen(event.currentTarget);
          }
        }}
        style={join ? undefined : { borderRadius: 16 }}
        className={cn(
          "group/letter absolute cursor-pointer outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50",
          position,
          radius,
        )}
      >
        <div className="perspective-distant absolute inset-0">
          <div
            className={cn(
              "relative h-full w-full transform-3d transition-transform duration-500 motion-reduce:transition-none",
              flipped && "transform-[rotateY(180deg)]",
            )}
          >
            <LetterSide className={cn(radius, border)} style={faceStyle}>
              <LetterFace fact={fact} loanLabel={fact.kind === "loan" ? t("loanMark") : null} />
            </LetterSide>
            <LetterSide className={cn("transform-[rotateY(180deg)]", backRadius, backBorder)} style={faceStyle}>
              <LetterFace fact={fact} cursive loanLabel={fact.kind === "loan" ? t("loanMark") : null} />
            </LetterSide>
          </div>
        </div>
        {fact.kind === "sofit" ? (
          <div className="absolute top-1.5 start-1.5 z-10" onClick={keepOnCard} onPointerDown={keepOnCard}>
            <SofitTip label={t("sofitTipLabel")} tip={t("sofitTip")} />
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-1 z-10 flex justify-center">
          <div className="pointer-events-auto" onClick={keepOnCard} onPointerDown={keepOnCard}>
            <MasteryRing level={mastery} size="sm" />
          </div>
        </div>
      </motion.div>
    </div>
  );
});

function LetterSide({
  className,
  style,
  children,
}: {
  className?: string;
  style?: { borderRadius?: number; boxShadow: string };
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden border-foreground/10 bg-card px-1.5 pt-2 pb-10 text-center backface-hidden group-hover/letter:bg-emerald-50",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

function LetterFace({ fact, cursive = false, loanLabel }: { fact: LetterFact; cursive?: boolean; loanLabel: string | null }) {
  return (
    <span className="flex min-w-0 flex-col items-center gap-1">
      <span
        dir="rtl"
        lang="he"
        className={cn(
          "leading-none",
          cursive
            ? cn("text-5xl md:text-7xl xl:text-8xl", cursiveFont.className)
            : cn("text-4xl font-bold md:text-6xl xl:text-7xl", printFont.className),
        )}
      >
        {fact.letter}
      </span>
      <span className="text-sm font-semibold tracking-wide text-emerald-800 md:text-base">{fact.sound}</span>
      <span className="max-w-full text-xs leading-tight text-muted-foreground md:text-sm">{fact.name}</span>
      {loanLabel ? (
        <span className="text-[0.65rem] font-medium tracking-wide text-emerald-800/70 uppercase">{loanLabel}</span>
      ) : null}
    </span>
  );
}

function SofitTip({ label, tip }: { label: string; tip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={label}
        onClick={keepOnCard}
        onPointerDown={keepOnCard}
        className="inline-flex size-7 items-center justify-center rounded-full text-emerald-800 outline-none hover:bg-emerald-100 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Info className="size-3.5" aria-hidden />
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={6}
        className="max-w-64 flex-col whitespace-normal text-left leading-relaxed"
      >
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}
