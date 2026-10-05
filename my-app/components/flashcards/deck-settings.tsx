"use client";

import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { SoundControls, type SoundChannel, type SoundPrefs } from "@/components/flashcards/sound-toggle";
import { Button } from "@/components/ui/button";
import type { CardSort } from "@/lib/flashcards/sort-cards";

export function DeckSettings({
  sort,
  onSort,
  prefs,
  onToggle,
}: {
  sort: CardSort;
  onSort: (sort: CardSort) => void;
  prefs: SoundPrefs;
  onToggle: (channel: SoundChannel) => void;
}) {
  const t = useTranslations("Flashcards");
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointer(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11 border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
        aria-label={t("settings")}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
      >
        <Settings />
      </Button>
      {open ? (
        <div
          role="dialog"
          aria-label={t("settings")}
          className="absolute top-full right-0 z-30 mt-2 w-72 rounded-2xl border border-emerald-950/10 bg-white p-4 shadow-[0_24px_60px_-28px_rgba(6,78,59,0.5)]"
        >
          <p className="text-xs font-medium tracking-[0.14em] text-emerald-800/70 uppercase">
            {t("soundGeneral")}
          </p>
          <div className="mt-3">
            <SoundControls
              prefs={prefs}
              onToggle={onToggle}
              className="flex flex-row items-start gap-2"
            />
          </div>
          <label className="mt-5 flex flex-col gap-2">
            <span className="text-xs font-medium tracking-[0.14em] text-emerald-800/70 uppercase">
              {t("sortCards")}
            </span>
            <select
              aria-label={t("sortCards")}
              value={sort}
              onChange={(event) => onSort(event.target.value as CardSort)}
              className="h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm text-emerald-950"
            >
              <optgroup label={t("sortGroupAlphabetical")}>
                <option value="az">{t("sortAz")}</option>
                <option value="za">{t("sortZa")}</option>
              </optgroup>
              <optgroup label={t("sortGroupAdded")}>
                <option value="newest">{t("sortNewest")}</option>
                <option value="oldest">{t("sortOldest")}</option>
              </optgroup>
              <optgroup label={t("sortGroupMastery")}>
                <option value="mastered">{t("sortMastered")}</option>
                <option value="unknown">{t("sortUnknown")}</option>
              </optgroup>
            </select>
          </label>
        </div>
      ) : null}
    </div>
  );
}
