"use client";

import { CaseSensitive, Quote, Settings, TextQuote, Volume2, VolumeX, WholeWord } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { SampleName } from "@/components/settings/settings-provider";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SoundChannel, SoundPrefs } from "@/components/flashcards/sound-toggle";

const STORAGE_KEY = "webrew.card-display";

export type CardDisplay = {
  nikud: boolean;
  example: boolean;
};

const DISPLAY_DEFAULTS: CardDisplay = { nikud: true, example: true };

export function useCardDisplay() {
  const [display, setDisplay] = useState<CardDisplay>(DISPLAY_DEFAULTS);
  const displayRef = useRef<CardDisplay>(DISPLAY_DEFAULTS);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return;
      }

      const record = parsed as Partial<CardDisplay>;
      const stored = {
        nikud: record.nikud !== false,
        example: record.example !== false,
      };
      displayRef.current = stored;
      setDisplay(stored);
    } catch {
      // Keep the defaults when the saved value is unreadable.
    }
  }, []);

  function toggle(key: keyof CardDisplay) {
    const next = { ...displayRef.current, [key]: !displayRef.current[key] };
    displayRef.current = next;
    setDisplay(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return { display, displayRef, toggle };
}

const menuSpring = { type: "spring" as const, bounce: 0.12, visualDuration: 0.28 };

export type StudyToolId = "word" | "general" | "sentence" | "nikud" | "example";

const allTools: StudyToolId[] = ["word", "general", "sentence", "nikud", "example"];

export function StudyTools({
  soundPrefs,
  onToggleSound,
  display = DISPLAY_DEFAULTS,
  onToggleDisplay,
  tools = allTools,
}: {
  soundPrefs: SoundPrefs;
  onToggleSound: (channel: SoundChannel) => void;
  display?: CardDisplay;
  onToggleDisplay?: (key: keyof CardDisplay) => void;
  tools?: readonly StudyToolId[];
}) {
  const t = useTranslations("Flashcards");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggleSound(enabled: boolean, always = false): SampleName | false {
    if (!soundPrefs.general && !always) {
      return false;
    }
    return enabled ? "popDown" : "popUp";
  }

  const toolList = [
    {
      id: "word",
      enabled: soundPrefs.word,
      dimmed: !soundPrefs.general,
      label: soundPrefs.word ? t("muteWord") : t("unmuteWord"),
      hint: t("toolWord"),
      icon: WholeWord,
      sound: toggleSound(soundPrefs.word),
      onClick: () => onToggleSound("word"),
    },
    {
      id: "general",
      enabled: soundPrefs.general,
      dimmed: false,
      label: soundPrefs.general ? t("muteSound") : t("unmuteSound"),
      hint: t("toolGeneral"),
      icon: soundPrefs.general ? Volume2 : VolumeX,
      sound: toggleSound(soundPrefs.general, true),
      onClick: () => onToggleSound("general"),
    },
    {
      id: "sentence",
      enabled: soundPrefs.sentence,
      dimmed: !soundPrefs.general,
      label: soundPrefs.sentence ? t("muteSentence") : t("unmuteSentence"),
      hint: t("toolSentence"),
      icon: TextQuote,
      sound: toggleSound(soundPrefs.sentence),
      onClick: () => onToggleSound("sentence"),
    },
    {
      id: "nikud",
      enabled: display.nikud,
      dimmed: false,
      label: display.nikud ? t("hideNikud") : t("showNikud"),
      hint: t("toolNikud"),
      icon: CaseSensitive,
      sound: toggleSound(display.nikud),
      onClick: () => onToggleDisplay?.("nikud"),
    },
    {
      id: "example",
      enabled: display.example,
      dimmed: false,
      label: display.example ? t("hideExample") : t("showExample"),
      hint: t("toolExample"),
      icon: Quote,
      sound: toggleSound(display.example),
      onClick: () => onToggleDisplay?.("example"),
    },
  ].filter((tool) => (tools as readonly string[]).includes(tool.id));

  return (
    <div ref={rootRef} className="flex items-center">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
        aria-expanded={open}
        aria-label={t("cardOptions")}
        onClick={() => setOpen((current) => !current)}
      >
        <motion.span
          className="inline-flex"
          animate={{ rotate: open ? 40 : 0 }}
          transition={menuSpring}
        >
          <Settings />
        </motion.span>
      </Button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="card-options"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={menuSpring}
            style={{ overflow: "hidden" }}
          >
            <div className="flex items-center gap-1 pl-1.5" role="group" aria-label={t("cardOptions")}>
              {toolList.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn(
                          "border-emerald-900/10 bg-white hover:bg-emerald-50",
                          tool.enabled ? "text-emerald-900" : "text-emerald-900/40",
                          tool.dimmed && "opacity-50",
                        )}
                        aria-pressed={tool.enabled}
                        aria-label={tool.label}
                        sound={tool.sound}
                        onClick={tool.onClick}
                      >
                        <Icon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={6}>
                      {tool.hint}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
