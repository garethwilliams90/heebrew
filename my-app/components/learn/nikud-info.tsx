"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { PointedLetter } from "@/components/learn/pointed-letter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { nikudCue, nikudCycle } from "@/lib/alephbet/intro-alphabet";
import { letterById } from "@/lib/alephbet/letter-lookup";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { playAudio } from "@/lib/settings/master-volume";

const betLetter = "\u05D1";
const bet = letterById.get("bet");

const groups = [
  [
    { id: "kamatz", sound: "vowelAh" },
    { id: "patach", sound: "vowelAh" },
  ],
  [
    { id: "tsere", sound: "vowelEh" },
    { id: "segol", sound: "vowelEh" },
  ],
  [{ id: "shva", sound: "vowelNone" }],
  [{ id: "hiriq", sound: "vowelEe" }],
  [
    { id: "kubutz", sound: "vowelOo" },
    { id: "shuruk", sound: "vowelOo" },
  ],
  [
    { id: "holam", sound: "vowelOh" },
    { id: "holamVav", sound: "vowelOh" },
  ],
] as const;

type NikudId = (typeof groups)[number][number]["id"];

export function NikudInfo() {
  const t = useTranslations("Learn");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<NikudId | null>(null);

  async function play(id: NikudId) {
    if (!bet) {
      return;
    }
    setSelected(id);
    const cue = nikudCue(bet, id);
    const audio = await loadSpeechClip(cue.text, cue.phoneme);
    if (!audio) {
      return;
    }
    audio.currentTime = 0;
    await playAudio(audio);
  }

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        type="button"
        aria-label={t("nikudInfoLabel")}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-emerald-800 outline-none hover:bg-emerald-100 focus-visible:ring-3 focus-visible:ring-emerald-700/30"
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        <Info className="size-4" aria-hidden />
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="start"
        sideOffset={8}
        collisionPadding={16}
        arrowClassName="bg-white fill-white"
        className="w-max max-w-[calc(100vw-2rem)] flex-col items-stretch gap-0 bg-white p-2 text-emerald-950 whitespace-normal shadow-[0_16px_40px_-28px_rgba(6,78,59,0.45)]"
      >
        <div className="flex flex-wrap gap-1">
          {groups.map((group) => (
            <div key={group[0].id} className="flex items-center rounded-lg border border-dotted border-emerald-800/45 p-1">
              {group.map((row) => {
                const nikud = nikudCycle.find((item) => item.id === row.id);
                if (!nikud) {
                  return null;
                }
                return (
                  <button
                    key={row.id}
                    type="button"
                    aria-label={`${t(nikud.label)}, ${t(row.sound)}`}
                    className={cn(
                      "flex h-15 w-15 cursor-pointer items-center justify-center rounded-md p-3 outline-none hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-700/30",
                      selected === row.id && "bg-emerald-100",
                    )}
                    onClick={() => void play(row.id)}
                  >
                    <span dir="rtl" lang="he" className={cn(printFont.className, "text-5xl leading-none")}>
                      <PointedLetter letter={betLetter} mark={nikud.mark} tail={nikud.tail} />
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
