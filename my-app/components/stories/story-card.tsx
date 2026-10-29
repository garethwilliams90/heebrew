"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { ChevronLeft, Languages, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { MediaGallery } from "@/components/content/media-gallery";
import { KeywordList, storyFlashcards } from "@/components/stories/keyword-list";
import { StoryMarks } from "@/components/stories/story-marks";
import { StoryPlayer } from "@/components/stories/story-player";
import { StoryQuiz } from "@/components/stories/story-quiz";
import { MediaUploader, StoryEditor } from "@/components/content/lazy-owner-tools";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteStory } from "@/lib/stories/actions";
import { alignStoryCues } from "@/lib/stories/align";
import { activeToken, keywordMarks, spreadCues, transcriptTokenLines, type WordCue } from "@/lib/stories/cues";
import { glossUnderHebrew, pairedTranscript } from "@/lib/stories/lines";
import type { StoryDetail } from "@/lib/stories/queries";
import { cn } from "cn";

const FlashcardSession = dynamic(() =>
  import("@/components/flashcards/flashcard-session").then((mod) => mod.FlashcardSession),
);
const QuizEditor = dynamic(() => import("@/components/stories/story-quiz").then((mod) => mod.QuizEditor));
const WordPicker = dynamic(() => import("@/components/stories/word-picker").then((mod) => mod.WordPicker));
const Fold = dynamic(() => import("@/components/stories/fold").then((mod) => mod.Fold));

const panel = "rounded-3xl border border-emerald-950/10 bg-white/90 p-4 text-emerald-950 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)]";
const keywordClass = "p-1 rounded text-blue-700 underline decoration-2 underline-offset-4 hover:bg-blue-300/20";

export function StoryCard({
  story,
  owner,
  signedIn,
  gloss,
}: {
  story: StoryDetail;
  owner: boolean;
  signedIn: boolean;
  gloss: string;
}) {
  const t = useTranslations("Stories");
  const alignStarted = useRef(false);
  const [editing, setEditing] = useState(false);
  const [studying, setStudying] = useState(false);
  const [tab, setTab] = useState("story");
  const [glossOn, setGlossOn] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [wordsOpen, setWordsOpen] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [aligned, setAligned] = useState<{ id: string; updatedAt: string; cues: WordCue[] } | null>(null);
  const lines = pairedTranscript(story.hebrew, gloss);
  const tokenLines = transcriptTokenLines(story.hebrew);
  const tokens = tokenLines.flat();
  const labels = story.words.map((word) => word.label);
  const savedCues =
    aligned && aligned.id === story.id && aligned.updatedAt === story.updatedAt && aligned.cues.length === tokens.length
      ? aligned.cues
      : story.cues;
  const cues = savedCues.length === tokens.length ? savedCues : durationMs > 0 ? spreadCues(tokens, durationMs) : [];
  const active = playing ? activeToken(cues, timeMs) : -1;
  const questions = story.questions.map((question) => ({
    ...question,
    choices: question.choices.map((choice) => ({ ...choice, correct: false })),
  }));
  const cards = storyFlashcards(story.words);

  function handlePlaying(next: boolean) {
    setPlaying(next);
    if (!next || alignStarted.current || (savedCues.length === tokens.length && savedCues.length > 0)) {
      return;
    }
    alignStarted.current = true;
    void alignStoryCues(story.id).then((nextCues) => {
      if (nextCues.length === tokens.length && nextCues.length > 0) {
        setAligned({ id: story.id, updatedAt: story.updatedAt, cues: nextCues });
      }
    });
  }

  function captureSelection() {
    const selected = window.getSelection()?.toString().replace(/\s+/g, " ").trim() ?? "";
    if (selected && story.hebrew.replace(/\s+/g, " ").includes(selected)) {
      setPhrase(selected);
      setWordsOpen(true);
    }
  }

  function hebrewToken(token: string, cueIndex: number, label: string | null) {
    const className = cn(label && keywordClass, cueIndex === active && "rounded bg-amber-200 px-0.5 text-emerald-950");
    if (!label) {
      return <span className={className}>{token}</span>;
    }
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className}>{token}</span>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    );
  }

  if (studying) {
    return (
      <article className={cn(panel, "flex min-h-[70vh] flex-col gap-4")}>
        <Button type="button" variant="outline" className="self-start" onClick={() => setStudying(false)}>
          <ChevronLeft data-icon="inline-start" />
          {t("backToStory")}
        </Button>
        <FlashcardSession
          embedded
          deckId={`story-${story.id}`}
          cards={cards}
          mode="new"
          count={cards.length}
          prompt="hebrew"
          onExit={() => {
            setStudying(false);
            setTab("words");
          }}
        />
      </article>
    );
  }

  return (
    <article className={panel}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold">{story.title}</h2>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">{t(story.level)}</span>
          {owner && !story.published ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-950">{t("draft")}</span>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {story.published ? (
            <StoryMarks storyId={story.id} signedIn={signedIn} hearted={story.hearted} completed={story.completed} />
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-pressed={glossOn}
            aria-label={glossOn ? t("hideGloss") : t("showGloss")}
            onClick={() => setGlossOn((on) => !on)}
          >
            <Languages />
          </Button>
          {owner ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-pressed={editing}
              aria-label={t("edit")}
              onClick={() => setEditing((on) => !on)}
            >
              <Pencil />
            </Button>
          ) : null}
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="mt-3">
        <TabsList className="w-full">
          <TabsTrigger value="story">{t("tabStory")}</TabsTrigger>
          <TabsTrigger value="words">{t("tabWords")}</TabsTrigger>
          <TabsTrigger value="quiz">{t("tabQuiz")}</TabsTrigger>
        </TabsList>
        <TabsContent value="story" className="text-base">
          {story.audioUrl ? (
            <StoryPlayer
              src={story.audioUrl}
              onTime={(seconds) => setTimeMs(seconds * 1000)}
              onPlaying={handlePlaying}
              onDuration={(seconds) => setDurationMs(Math.round(seconds * 1000))}
            />
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{t("audioMissing")}</p>
          )}
          <div className="mt-3 flex flex-col gap-3" onMouseUp={editing ? captureSelection : undefined} onKeyUp={editing ? captureSelection : undefined}>
            {lines.map((line, lineIndex) => {
              const lineTokens = tokenLines[lineIndex] ?? [];
              const marks = keywordMarks(lineTokens, story.words);
              const glossSlots = glossUnderHebrew(lineTokens, glossOn ? line.gloss : "", labels);
              const offset = tokenLines.slice(0, lineIndex).reduce((sum, row) => sum + row.length, 0);
              if (!glossOn) {
                return (
                  <p key={`${lineIndex}:${line.hebrew}`} dir="rtl" lang="he" translate="no" className={cn(printFont.className, "text-2xl leading-relaxed")}>
                    {lineTokens.map((token, index) => {
                      const cueIndex = offset + index;
                      return (
                        <span key={cueIndex}>
                          {hebrewToken(token, cueIndex, marks[index] ?? null)}
                          {index < lineTokens.length - 1 ? " " : null}
                        </span>
                      );
                    })}
                  </p>
                );
              }
              return (
                <div key={`${lineIndex}:${line.hebrew}`} dir="rtl" className={cn(printFont.className, "flex flex-wrap gap-x-3 gap-y-2 text-2xl leading-relaxed")}>
                  {lineTokens.map((token, index) => {
                    const cueIndex = offset + index;
                    const slot = glossSlots[index];
                    return (
                      <span key={cueIndex} className="inline-flex flex-col items-center">
                        <span lang="he" translate="no">
                          {hebrewToken(token, cueIndex, marks[index] ?? null)}
                        </span>
                        {slot && slot.words.length > 0 ? (
                          <span dir="ltr" className="text-center text-sm italic font-extralight text-muted-foreground">
                            {slot.words.map((word, wordIndex) => (
                              <span key={`${cueIndex}:${wordIndex}`} className={word.keyword ? "underline decoration-2 underline-offset-4" : undefined}>
                                {wordIndex > 0 ? " " : null}
                                {word.text}
                              </span>
                            ))}
                          </span>
                        ) : null}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <MediaGallery items={story.media} owner={editing} />
        </TabsContent>
        <TabsContent value="words" className="flex flex-col gap-3 text-base">
          {story.words.length > 0 ? (
            <>
              <Button type="button" className="self-start" onClick={() => setStudying(true)}>
                {t("studyFlashcards")}
              </Button>
              <KeywordList words={story.words} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t("emptyWords")}</p>
          )}
        </TabsContent>
        <TabsContent value="quiz" className="text-base">
          {questions.length > 0 ? (
            <StoryQuiz storyId={story.id} questions={questions} bare />
          ) : (
            <p className="text-sm text-muted-foreground">{t("emptyQuiz")}</p>
          )}
        </TabsContent>
      </Tabs>
      {editing ? (
        <div className="mt-4 flex flex-col gap-4">
          <StoryEditor key={`${story.id}:${story.updatedAt}`} story={story} />
          <MediaUploader storyId={story.id} bare />
          <Fold title={story.words.length > 0 ? `${t("wordTitle")} (${story.words.length})` : t("wordTitle")} open={wordsOpen} onToggle={setWordsOpen}>
            <WordPicker storyId={story.id} phrase={phrase} words={story.words} />
          </Fold>
          <Fold title={t("quizTitle")}>
            <QuizEditor key={story.updatedAt} storyId={story.id} questions={story.questions} bare />
          </Fold>
          <form action={deleteStory}>
            <input type="hidden" name="id" value={story.id} />
            <Button type="submit" variant="destructive">
              {t("delete")}
            </Button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
