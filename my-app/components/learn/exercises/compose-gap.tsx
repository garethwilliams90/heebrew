"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { AnswerPop, answerTone, type AnswerTone } from "@/components/learn/exercises/answer-mark";
import { ExerciseChrome } from "@/components/learn/exercises/lesson-session";
import { useAdvance } from "@/components/learn/exercises/use-advance";
import { printFont } from "@/components/alephbet/print-font";
import { HearReplayButton } from "@/components/learn/hear-replay";
import { GlossLabel } from "@/components/learn/gloss-label";
import { stripGenderNote } from "@/lib/learn/gender-note";
import { glossOf } from "@/lib/learn/sentences";
import { seededOrder } from "@/lib/learn/pathway/order";
import { playStudyClip } from "@/lib/learn/pathway/play-study";
import type { GapItem, GapPiece } from "@/lib/learn/pathway/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

const cardSpring = { type: "spring" as const, bounce: 0.28, visualDuration: 0.22 };

export function ComposeGap({
  items,
  onPass,
  onMiss,
}: {
  items: readonly GapItem[];
  onPass: () => void;
  onMiss?: () => void;
}) {
  const t = useTranslations("Learn");
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [blocked, setBlocked] = useState<string[]>([]);
  const [tone, setTone] = useState<AnswerTone>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const item = items[index];
  const advance = useAdvance(() => {
    if (index >= items.length - 1) {
      onPass();
      return;
    }
    setTone(null);
    setPlaced({});
    setBlocked([]);
    setIndex((current) => current + 1);
  }, onMiss);

  useEffect(() => {
    if (!item) {
      return;
    }
    void playStudyClip({ hebrew: item.say, say: item.say, audio: item.audio });
  }, [item]);

  if (!item) {
    return null;
  }

  const bank = seededOrder([...item.tokens.filter((token) => token.blank), ...item.extras], item.id);
  const used = new Set(Object.values(placed));
  const blanks = item.tokens.filter((token) => token.blank);

  function pieceById(id: string): GapPiece | undefined {
    return [...item.tokens, ...item.extras].find((token) => token.id === id);
  }

  function fill(blankId: string, pieceId: string) {
    if (blocked.includes(pieceId) || tone === "correct" || !item) {
      return;
    }
    const next = { ...placed };
    for (const [blank, id] of Object.entries(next)) {
      if (id === pieceId) {
        delete next[blank];
      }
    }
    next[blankId] = pieceId;
    setPlaced(next);
    if (blanks.some((token) => !next[token.id])) {
      return;
    }
    const correct = blanks.every((token) => next[token.id] === token.id);
    if (correct) {
      setTone("correct");
      advance.pass();
      return;
    }
    const wrongPieces = blanks.flatMap((token) => {
      const placedId = next[token.id];
      return placedId && placedId !== token.id ? [placedId] : [];
    });
    setBlocked((current) => [...current, ...wrongPieces]);
    setTone("wrong");
    advance.miss(() => void playStudyClip({ hebrew: item.say, say: item.say, audio: item.audio }));
    const kept: Record<string, string> = {};
    for (const token of blanks) {
      if (next[token.id] === token.id) {
        kept[token.id] = token.id;
      }
    }
    window.setTimeout(() => {
      setTone(null);
      setPlaced(kept);
    }, 700);
  }

  function returnPiece(pieceId: string) {
    if (tone === "correct" || blocked.includes(pieceId)) {
      return;
    }
    setPlaced((current) => {
      const next = { ...current };
      for (const [blank, id] of Object.entries(next)) {
        if (id === pieceId) {
          delete next[blank];
        }
      }
      return next;
    });
  }

  function dropAt(point: { x: number; y: number }, pieceId: string) {
    if (tone === "correct" || blocked.includes(pieceId)) {
      return;
    }
    const hit = blanks.find((token) => {
      const node = slotRefs.current[token.id];
      if (!node) {
        return false;
      }
      const box = node.getBoundingClientRect();
      return point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;
    });
    if (hit) {
      fill(hit.id, pieceId);
      return;
    }
    if (Object.values(placed).includes(pieceId)) {
      returnPiece(pieceId);
    }
  }

  const hintPieces = bank.filter((token) => item.extras.some((extra) => extra.id === token.id) && !blocked.includes(token.id) && !used.has(token.id));

  function hint() {
    const pick = hintPieces[Math.floor(Math.random() * hintPieces.length)];
    if (pick) {
      setBlocked((current) => [...current, pick.id]);
    }
  }

  return (
    <ExerciseChrome index={index} total={items.length} prompt={t("gapPrompt")} canHint={hintPieces.length > 0} onHint={hint}>
      <div className="flex w-full max-w-3xl flex-col items-center gap-5">
        <HearReplayButton onHear={() => void playStudyClip({ hebrew: item.say, say: item.say, audio: item.audio })}>
          {t("quizHear")}
        </HearReplayButton>
        <AnswerPop tone={tone} className="w-full">
          <div
            className="flex min-h-24 w-full flex-wrap items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-emerald-700/35 bg-white/70 p-3"
            dir="rtl"
            lang="he"
          >
            {item.tokens.map((token) => {
              if (!token.blank) {
                return (
                  <span key={token.id} className={cn(printFont.className, "px-1 text-3xl text-emerald-950")}>
                    {token.hebrew}
                  </span>
                );
              }
              const filled = placed[token.id] ? pieceById(placed[token.id] ?? "") : undefined;
              const slotTone: AnswerTone = !filled ? null : tone === "correct" ? "correct" : tone === "wrong" && filled.id !== token.id ? "wrong" : null;
              return (
                <div
                  key={token.id}
                  ref={(node) => {
                    slotRefs.current[token.id] = node;
                  }}
                  className={cn(
                    "flex h-16 min-w-24 items-center justify-center rounded-2xl border border-dashed border-emerald-700 bg-emerald-50/80 px-2",
                    slotTone && "border-solid",
                    answerTone(slotTone),
                  )}
                >
                  {filled ? (
                    <GapChip piece={filled} onDrop={(point) => dropAt(point, filled.id)} onReturn={() => returnPiece(filled.id)} />
                  ) : (
                    <span className="text-xs text-emerald-800/50">{t("dropWordHere")}</span>
                  )}
                </div>
              );
            })}
          </div>
        </AnswerPop>
        <div className="flex w-full flex-wrap items-center justify-center gap-2" dir="rtl">
          {bank
            .filter((token) => !used.has(token.id))
            .map((token) => (
              <GapChip
                key={token.id}
                piece={token}
                disabled={blocked.includes(token.id)}
                onDrop={(point) => dropAt(point, token.id)}
                onPlace={() => {
                  const empty = blanks.find((blank) => !placed[blank.id]);
                  if (empty) {
                    fill(empty.id, token.id);
                  }
                }}
              />
            ))}
        </div>
      </div>
    </ExerciseChrome>
  );
}

function GapChip({
  piece,
  disabled = false,
  onDrop,
  onPlace,
  onReturn,
}: {
  piece: GapPiece;
  disabled?: boolean;
  onDrop: (point: { x: number; y: number }) => void;
  onPlace?: () => void;
  onReturn?: () => void;
}) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const dragged = useRef(false);
  const meaning = stripGenderNote(glossOf(piece.gloss, locale));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          type="button"
          drag={!disabled}
          dragSnapToOrigin
          dragElastic={0.16}
          dragMomentum={false}
          whileHover={disabled ? undefined : { scale: 1.04, y: -2 }}
          whileDrag={{ scale: 1.06, zIndex: 40 }}
          transition={cardSpring}
          disabled={disabled}
          className={cn(
            printFont.className,
            "z-10 flex h-14 min-w-16 cursor-grab items-center justify-center rounded-2xl border border-emerald-950/10 bg-white px-3 text-2xl text-black shadow-[0_12px_28px_-22px_rgba(6,78,59,0.9)] active:cursor-grabbing disabled:cursor-default disabled:opacity-40",
          )}
          dir="rtl"
          lang="he"
          aria-label={t("wordCard", { word: piece.hebrew, meaning })}
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
              onPlace?.();
            }
          }}
          onDoubleClick={onReturn}
        >
          {piece.hebrew}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-white px-3 py-1.5 text-emerald-950 shadow-sm" arrowClassName="bg-white fill-white">
        <GlossLabel gloss={piece.gloss} />
      </TooltipContent>
    </Tooltip>
  );
}
