"use client";

import { useEffect, useRef, useState } from "react";
import { TextQuote, Volume2, VolumeX, WholeWord } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCue } from "@/components/settings/use-cue";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "webrew.sound";

export type SoundChannel = "general" | "word" | "sentence";

export type SoundPrefs = Record<SoundChannel, boolean>;

const DEFAULTS: SoundPrefs = { general: true, word: true, sentence: true };

export function readSoundPrefs(): SoundPrefs {
  if (typeof window === "undefined") {
    return DEFAULTS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "off") {
    return { ...DEFAULTS, general: false };
  }
  if (!raw || raw === "on") {
    return DEFAULTS;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return DEFAULTS;
    }

    const record = parsed as Partial<SoundPrefs>;
    return {
      general: record.general !== false,
      word: record.word !== false,
      sentence: record.sentence !== false,
    };
  } catch {
    return DEFAULTS;
  }
}

function writeSoundPrefs(prefs: SoundPrefs) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function useSoundPrefs() {
  const [prefs, setPrefs] = useState<SoundPrefs>(DEFAULTS);
  const prefsRef = useRef<SoundPrefs>(DEFAULTS);

  useEffect(() => {
    const stored = readSoundPrefs();
    prefsRef.current = stored;
    setPrefs(stored);
  }, []);

  function setChannel(channel: SoundChannel, enabled: boolean) {
    const next = { ...prefsRef.current, [channel]: enabled };
    prefsRef.current = next;
    setPrefs(next);
    writeSoundPrefs(next);
  }

  function allows(kind: "word" | "sentence") {
    return prefsRef.current.general && prefsRef.current[kind];
  }

  return { prefs, prefsRef, setChannel, allows };
}

const channels: {
  id: SoundChannel;
  label: "soundGeneral" | "wordAudio" | "sentenceAudio";
  mute: "muteSound" | "muteWord" | "muteSentence";
  unmute: "unmuteSound" | "unmuteWord" | "unmuteSentence";
}[] = [
  { id: "general", label: "soundGeneral", mute: "muteSound", unmute: "unmuteSound" },
  { id: "word", label: "wordAudio", mute: "muteWord", unmute: "unmuteWord" },
  { id: "sentence", label: "sentenceAudio", mute: "muteSentence", unmute: "unmuteSentence" },
];

export function SoundControls({
  prefs,
  onToggle,
  className,
}: {
  prefs: SoundPrefs;
  onToggle: (channel: SoundChannel) => void;
  className?: string;
}) {
  const t = useTranslations("Flashcards");
  const playOn = useCue("/sounds/samples/pop-up-on.mp3");
  const playOff = useCue("/sounds/samples/pop-down.mp3");

  return (
    <div
      className={className ?? "flex flex-wrap items-center gap-1.5"}
      role="group"
      aria-label={t("soundGeneral")}
    >
      {channels.map((channel) => {
        const enabled = prefs[channel.id];
        const Icon =
          channel.id === "word" ? WholeWord : channel.id === "sentence" ? TextQuote : enabled ? Volume2 : VolumeX;

        return (
          <Button
            key={channel.id}
            type="button"
            variant="outline"
            size="sm"
            className={`h-8 gap-1 rounded-full px-2.5 text-xs ${
              enabled
                ? "border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
                : "border-emerald-900/10 bg-emerald-950/5 text-emerald-900/45 hover:bg-emerald-50"
            } ${!prefs.general && channel.id !== "general" ? "opacity-50" : ""}`}
            aria-pressed={enabled}
            aria-label={enabled ? t(channel.mute) : t(channel.unmute)}
            onClick={() => {
              if (prefs.general || channel.id === "general") {
                if (enabled) {
                  playOff();
                } else {
                  playOn();
                }
              }
              onToggle(channel.id);
            }}
          >
            <Icon />
            {t(channel.label)}
          </Button>
        );
      })}
    </div>
  );
}
