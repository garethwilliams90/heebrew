"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { PointedLetter } from "@/components/learn/pointed-letter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { nikudCycle } from "@/lib/alephbet/intro-alphabet";

const dalet = "\u05D3";

const soundKey = {
  kamatz: "soundKamatz",
  patach: "soundPatach",
  tsere: "soundTsere",
  segol: "soundSegol",
  shva: "soundShva",
  hiriq: "soundHiriq",
  kubutz: "soundKubutz",
  shuruk: "soundShuruk",
  holam: "soundHolam",
  holamVav: "soundHolamVav",
} as const;

export function NikudInfo() {
  const t = useTranslations("Learn");
  const [open, setOpen] = useState(false);

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
        sideOffset={8}
        collisionPadding={16}
        arrowClassName="bg-white fill-white"
        className="max-h-[70vh] max-w-md flex-col items-stretch gap-3 overflow-y-auto bg-white p-5 text-left text-lg text-emerald-950 whitespace-normal shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)]"
      >
        <ul className="flex flex-col gap-3">
          {nikudCycle.map((nikud) => (
            <li key={nikud.id} className="flex items-center gap-4">
              <span dir="rtl" lang="he" className={cn(printFont.className, "text-6xl leading-none")}>
                <PointedLetter letter={dalet} mark={nikud.mark} tail={nikud.tail} />
              </span>
              <span className="text-xl leading-snug">{t(soundKey[nikud.id])}</span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
