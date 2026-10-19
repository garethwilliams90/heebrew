"use client";

import { Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FamiliaritySelect } from "@/components/flashcards/familiarity-select";
import { GenderMark } from "@/components/flashcards/gender-mark";
import { MarkedText } from "@/components/flashcards/marked-text";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { SoundControls, type SoundChannel, type SoundPrefs } from "@/components/flashcards/sound-toggle";
import { Button } from "@/components/ui/button";
import type { Flashcard, RecallGrade } from "@/lib/flashcards/types";

export type StudyCard = Flashcard & { mastery: number };

const grades: RecallGrade[] = ["dontKnow", "know", "knowWell", "memorised"];

export function StudyCardView({
  card,
  flipped,
  prompt,
  speakingClip,
  speechError,
  soundPrefs,
  onToggleSound,
  completed,
  total,
  reviewCompleted,
  reviewTotal,
  progressLabel,
  onFlip,
  onSpeak,
  onSpeakExample,
  onFamiliarity,
  onGrade,
}: {
  card: StudyCard;
  flipped: boolean;
  prompt: "english" | "hebrew";
  speakingClip: string | null;
  speechError: boolean;
  soundPrefs: SoundPrefs;
  onToggleSound: (channel: SoundChannel) => void;
  completed: number;
  total: number;
  reviewCompleted: number;
  reviewTotal: number;
  progressLabel: "progress" | "reviewProgress";
  onFlip: () => void;
  onSpeak: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSpeakExample: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFamiliarity: (level: number) => void;
  onGrade: (grade: RecallGrade) => void;
}) {
  const t = useTranslations("Flashcards");
  const learnRatio = total === 0 ? 0 : Math.round((completed / total) * 100);
  const reviewRatio = reviewTotal === 0 ? 0 : Math.round((reviewCompleted / reviewTotal) * 100);
  const wordKey = card.audioUrl ?? card.hebrew;
  const wordPlaying = speakingClip === wordKey;
  const sentenceKey = card.exampleAudioUrl || card.hebrewExample;
  const sentencePlaying = speakingClip === sentenceKey;
  const englishFace = (
    <>
      <p className="text-xs font-medium tracking-[0.16em] text-emerald-800/70 uppercase">
        {t(`pos.${card.partOfSpeech}`)}
      </p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-emerald-950 sm:text-6xl">
        {card.english}
      </h1>
      {card.example ? (
        <p className="mt-6 max-w-sm text-lg text-emerald-950/70">
          <MarkedText text={card.example} bold={card.exampleBold} />
        </p>
      ) : null}
    </>
  );
  const hebrewFace = (
    <>
      <div className="flex items-center gap-3">
        {card.gender ? <GenderMark gender={card.gender} /> : null}
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
          aria-label={wordPlaying ? t("listening") : t("listen")}
          disabled={!soundPrefs.general || !soundPrefs.word || wordPlaying}
          onClick={onSpeak}
        >
          <Volume2 />
        </Button>
      </div>
      <h2 dir="rtl" lang="he" className="mt-4 text-6xl font-semibold text-emerald-950">
        {card.hebrew}
      </h2>
      {card.hebrewExample ? (
        <div dir="rtl" lang="he" className="mt-6 flex max-w-sm items-start justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="mt-0.5 shrink-0 border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
            aria-label={sentencePlaying ? t("listening") : t("listenSentence")}
            disabled={!soundPrefs.general || !soundPrefs.sentence || sentencePlaying}
            onClick={onSpeakExample}
          >
            <Volume2 />
          </Button>
          <p className="text-lg text-emerald-950/70">
            <MarkedText text={card.hebrewExample} bold={card.hebrewExampleBold} />
          </p>
        </div>
      ) : null}
    </>
  );
  const front = prompt === "hebrew" ? hebrewFace : englishFace;
  const back = prompt === "hebrew" ? englishFace : hebrewFace;

  return (
    <div className="flex w-full max-w-xl flex-1 flex-col justify-center">
      <div className="mb-4 flex items-center justify-between gap-4 text-sm text-emerald-900/70">
        <p>
          {t(progressLabel, {
            done: progressLabel === "reviewProgress" ? reviewCompleted : completed,
            total: progressLabel === "reviewProgress" ? reviewTotal : total,
          })}
        </p>
        <FamiliaritySelect level={card.mastery} onChange={onFamiliarity} />
      </div>
      {prompt === "hebrew" ? (
        <p className="mb-3 text-sm text-emerald-800">{t("reviewHint")}</p>
      ) : null}
      <div className="mb-4">
        <SoundControls prefs={soundPrefs} onToggle={onToggleSound} />
      </div>
      <div className="mb-6 flex gap-1.5">
        <ProgressMeter
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-emerald-950/10"
          label={t("progress", { done: completed, total })}
          value={completed}
          max={Math.max(total, 1)}
          ratio={learnRatio}
        />
        <ProgressMeter
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-emerald-950/10"
          label={t("reviewProgress", { done: reviewCompleted, total: reviewTotal })}
          value={reviewCompleted}
          max={Math.max(reviewTotal, 1)}
          ratio={reviewRatio}
        />
      </div>

      <div className="perspective-distant">
        <div
          onClick={onFlip}
          key={card.id}
          className={`relative h-80 transform-3d cursor-pointer rounded-[2rem] transition-transform duration-500 motion-reduce:transition-none sm:h-96 ${flipped ? "transform-[rotateY(180deg)]" : ""}`}
        >
          <CardFace className={flipped ? "pointer-events-none" : ""}>{front}</CardFace>
          <CardFace className={`transform-[rotateY(180deg)] ${flipped ? "" : "pointer-events-none"}`}>
            {back}
          </CardFace>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-emerald-900/60">{t("flipHint")}</p>
      {speechError ? (
        <p className="mt-2 text-center text-sm text-red-800" role="alert">
          {t("speechError")}
        </p>
      ) : null}

      <div
        className={`mt-4 grid grid-cols-2 gap-2 transition-opacity duration-300 sm:grid-cols-4 ${flipped ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        {grades.map((grade) => (
          <Button
            key={grade}
            type="button"
            variant={grade === "memorised" ? "default" : "outline"}
            className={
              grade === "memorised"
                ? "h-12 bg-emerald-800 text-white hover:bg-emerald-900"
                : "h-12 border-emerald-900/10 bg-white text-emerald-950 hover:bg-emerald-50"
            }
            disabled={!flipped}
            onClick={() => onGrade(grade)}
          >
            {t(grade)}
          </Button>
        ))}
      </div>
    </div>
  );
}

function CardFace({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-emerald-950/10 bg-white/90 px-8 text-center shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)] backface-hidden ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
