"use client";

import { Pencil, Trash2, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { MarkedText } from "@/components/flashcards/marked-text";
import { MasteryRing } from "@/components/flashcards/mastery-ring";
import { Button } from "@/components/ui/button";
import type { Flashcard, GrammaticalGender } from "@/lib/flashcards/types";
import { GenderMark } from "./gender-mark";

export function BrowserCard({
  card,
  level,
  wordPlaying,
  sentencePlaying,
  failed,
  wordEnabled,
  sentenceEnabled,
  confirmingDelete,
  readOnly = false,
  onPlayWord,
  onPlaySentence,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  card: Flashcard;
  level: number;
  wordPlaying: boolean;
  sentencePlaying: boolean;
  failed: boolean;
  wordEnabled: boolean;
  sentenceEnabled: boolean;
  confirmingDelete: boolean;
  readOnly?: boolean;
  onPlayWord: () => void;
  onPlaySentence?: () => void;
  onEdit?: () => void;
  onAskDelete?: () => void;
  onCancelDelete?: () => void;
  onDelete?: () => void;
}) {
  const t = useTranslations("Flashcards");

  return (
    <li className="rounded-3xl border border-emerald-950/10 bg-white/90 p-5 shadow-[0_24px_60px_-40px_rgba(6,78,59,0.45)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.16em] text-emerald-800/70 uppercase flex items-center gap-1">
            {t(`pos.${card.partOfSpeech}`)}
            {card.gender ? ` · ` : ""}
            {card.gender ? <GenderMark gender={card.gender as GrammaticalGender} /> : null}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">{card.english}</h2>
          {card.example ? (
            <p className="mt-2 text-slate-500 italic font-extralight">
              <MarkedText text={card.example} bold={card.exampleBold} />
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {readOnly ? null : <MasteryRing level={level} />}
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
            aria-label={wordPlaying ? t("listening") : t("listen")}
            disabled={!wordEnabled || wordPlaying}
            sound={false}
            onClick={onPlayWord}
          >
            <Volume2 />
          </Button>
        </div>
      </div>
      <p dir="rtl" lang="he" translate="no" className="mt-4 text-3xl font-semibold">
        {card.hebrew}
      </p>
      {card.hebrewExample ? (
        <div dir="rtl" lang="he" className="mt-2 flex items-start gap-2">
          {card.exampleAudioUrl ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mt-0.5 shrink-0 border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
              aria-label={sentencePlaying ? t("listening") : t("listenSentence")}
              disabled={!sentenceEnabled || sentencePlaying}
              sound={false}
              onClick={onPlaySentence}
            >
              <Volume2 />
            </Button>
          ) : null}
          <p className="text-slate-500 italic font-extralight">
            <MarkedText text={card.hebrewExample} bold={card.hebrewExampleBold} />
          </p>
        </div>
      ) : null}
      {failed ? (
        <p className="mt-3 text-sm text-red-800" role="alert">
          {t("speechError")}
        </p>
      ) : null}
      {readOnly ? null : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 border-emerald-900/10 bg-white text-emerald-950 hover:bg-emerald-50"
            onClick={onEdit}
          >
            <Pencil />
          </Button>
          {confirmingDelete ? (
            <>
              <p className="text-sm text-emerald-900/70">{t("deleteCardConfirm")}</p>
              <Button
                type="button"
                variant="outline"
                className="h-9 border-red-200 bg-white text-red-800 hover:bg-red-50"
                onClick={onDelete}
              >
                {t("deleteCard")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 border-emerald-900/10 bg-white hover:bg-emerald-50"
                onClick={onCancelDelete}
              >
                {t("cancel")}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-9 border-red-200 bg-white text-red-800 hover:bg-red-50"
              onClick={onAskDelete}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
