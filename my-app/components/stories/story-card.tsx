"use client";

import dynamic from "next/dynamic";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronLeft, Languages, Pencil } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { MediaGallery } from "@/components/content/media-gallery";
import { MediaUploader } from "@/components/content/lazy-owner-tools";
import { KeywordList, storyFlashcards } from "@/components/stories/keyword-list";
import { ink } from "@/components/stories/ink";
import { StoryMarks } from "@/components/stories/story-marks";
import { StoryPlayer } from "@/components/stories/story-player";
import { StoryQuiz } from "@/components/stories/story-quiz";
import { StoryLearn } from "@/components/stories/story-learn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteStory, saveStory, type StoryActionState } from "@/lib/stories/actions";
import { STORY_AUDIO_MAX_BYTES } from "@/lib/stories/audio";
import { alignStoryCues } from "@/lib/stories/align";
import { activeToken, keywordMarks, spreadCues, transcriptTokenLines, type WordCue } from "@/lib/stories/cues";
import { glossUnderHebrew, pairedTranscript } from "@/lib/stories/lines";
import type { PathwayLessonSection } from "@/lib/learn/pathway/lesson-links";
import { lessonIsVisible } from "@/lib/stories/lesson-model";
import type { StoryDetail, StoryLevel, StoryTab } from "@/lib/stories/queries";

const storyLevels = ["beginner", "intermediate", "advanced"] as const satisfies readonly StoryLevel[];
import { cn } from "cn";

const FlashcardSession = dynamic(() =>
  import("@/components/flashcards/flashcard-session").then((mod) => mod.FlashcardSession),
);
const QuizEditor = dynamic(() => import("@/components/stories/story-quiz").then((mod) => mod.QuizEditor));
const StoryLearnEditor = dynamic(() => import("@/components/stories/story-learn-editor").then((mod) => mod.StoryLearnEditor));
const WordPicker = dynamic(() => import("@/components/stories/word-picker").then((mod) => mod.WordPicker));

const panel = "rounded-3xl border border-emerald-950/10 bg-white/90 p-4 text-emerald-950 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)]";
const keywordClass = "p-1 rounded text-blue-700 underline decoration-2 underline-offset-4 hover:bg-blue-300/20";

export function StoryCard({
  story,
  owner,
  signedIn,
  gloss,
  catalog = [],
  startTab = "story",
  focused = false,
}: {
  story: StoryDetail;
  owner: boolean;
  signedIn: boolean;
  gloss: string;
  catalog?: PathwayLessonSection[];
  startTab?: StoryTab;
  focused?: boolean;
}) {
  const t = useTranslations("Stories");
  const locale = useLocale();
  const cardRef = useRef<HTMLElement>(null);
  const alignStarted = useRef(false);
  const learnOpen = owner || lessonIsVisible(story.lesson);
  const [editingTab, setEditingTab] = useState<StoryTab | null>(null);
  const [studying, setStudying] = useState(false);
  const [tab, setTab] = useState(startTab === "learn" && !learnOpen ? "story" : startTab);
  const [title, setTitle] = useState(story.title);
  const [hebrew, setHebrew] = useState(story.hebrew);
  const [storyLevel, setStoryLevel] = useState(story.level);
  const glossLocale = locale === "fr" || locale === "es" ? locale : "en";
  const [glossText, setGlossText] = useState(story.gloss[glossLocale]);
  const editingStory = editingTab === "story";
  const formId = `story-save-${story.id}`;
  const [saveState, saveAction, saving] = useActionState(saveStory, { error: "" } as StoryActionState);
  const [audioTooBig, setAudioTooBig] = useState(false);
  const glossChanged = glossText !== story.gloss[glossLocale];
  const transcriptEn = glossLocale === "en" ? glossText : story.gloss.en;
  const transcriptFr = glossLocale === "fr" ? glossText : glossLocale === "en" && glossChanged ? "" : story.gloss.fr;
  const transcriptEs = glossLocale === "es" ? glossText : glossLocale === "en" && glossChanged ? "" : story.gloss.es;

  useEffect(() => {
    if (focused) {
      cardRef.current?.scrollIntoView({ block: "start" });
    }
  }, [focused]);

  useEffect(() => {
    setTitle(story.title);
    setHebrew(story.hebrew);
    setStoryLevel(story.level);
    setGlossText(story.gloss[glossLocale]);
  }, [glossLocale, story.gloss, story.hebrew, story.level, story.title, story.updatedAt]);

  const [glossOn, setGlossOn] = useState(false);
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
    <article ref={cardRef} id={`story-${story.id}`} className={cn(panel, focused && "scroll-mt-24")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {editingStory ? (
            <input
              form={formId}
              name="title"
              className={cn(ink, "w-auto min-w-0 text-xl font-semibold")}
              value={title}
              maxLength={120}
              required
              aria-label={t("titleLabel")}
              onChange={(event) => setTitle(event.target.value)}
            />
          ) : (
            <h2 className="text-xl font-semibold">{story.title}</h2>
          )}
          {editingStory ? (
            <select
              form={formId}
              name="level"
              className="rounded-full border-0 bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 outline-none"
              value={storyLevel}
              aria-label={t("levelLabel")}
              onChange={(event) => setStoryLevel(event.target.value as StoryLevel)}
            >
              {storyLevels.map((level) => (
                <option key={level} value={level}>
                  {t(level)}
                </option>
              ))}
            </select>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">{t(story.level)}</span>
          )}
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
              aria-pressed={editingTab === tab}
              aria-label={t("edit")}
              onClick={() => setEditingTab((current) => (current === tab ? null : tab))}
            >
              <Pencil />
            </Button>
          ) : null}
        </div>
      </div>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (value === "story" || value === "words" || value === "quiz" || value === "learn") {
            setTab(value);
          }
        }}
        className="mt-3"
      >
        <TabsList className="w-full">
          <TabsTrigger value="story">{t("tabStory")}</TabsTrigger>
          <TabsTrigger value="words">{t("tabWords")}</TabsTrigger>
          <TabsTrigger value="quiz">{t("tabQuiz")}</TabsTrigger>
          {learnOpen ? (
            <TabsTrigger value="learn">
              {t("tabLearn")}
              <Badge variant="default">{t("newLesson")}</Badge>
            </TabsTrigger>
          ) : null}
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
          {editingStory ? (
            <div className="mt-3 flex flex-col gap-3">
              <textarea
                form={formId}
                name="hebrew"
                className={cn(ink, printFont.className, "field-sizing-content text-2xl leading-relaxed")}
                dir="rtl"
                lang="he"
                translate="no"
                value={hebrew}
                maxLength={20000}
                rows={4}
                required
                aria-label={t("hebrewLabel")}
                onChange={(event) => setHebrew(event.target.value)}
              />
              {glossOn ? (
                <textarea
                  className={cn(ink, "field-sizing-content text-sm italic font-extralight text-muted-foreground")}
                  value={glossText}
                  maxLength={20000}
                  rows={3}
                  aria-label={t(glossLocale === "fr" ? "frLabel" : glossLocale === "es" ? "esLabel" : "enLabel")}
                  onChange={(event) => setGlossText(event.target.value)}
                />
              ) : null}
            </div>
          ) : (
          <div className="mt-3 flex flex-col gap-3">
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
          )}
          <MediaGallery items={story.media} owner={editingStory} />
          {editingStory ? (
            <>
              <form
                id={formId}
                action={saveAction}
                className="mt-3 flex flex-col gap-3"
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  const file = new FormData(event.currentTarget).get("audio");
                  const oversized = file instanceof File && file.size > STORY_AUDIO_MAX_BYTES;
                  setAudioTooBig(oversized);
                  if (oversized) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={story.id} />
                <input type="hidden" name="transcriptEn" value={transcriptEn} />
                <input type="hidden" name="transcriptFr" value={transcriptFr} />
                <input type="hidden" name="transcriptEs" value={transcriptEs} />
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" name="published" value="true" defaultChecked={story.published} />
                  {t("publish")}
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  {t("audioReplace")}
                  <input
                    type="file"
                    name="audio"
                    accept="audio/mpeg,audio/mp4,audio/wav,audio/webm,.mp3,.m4a,.wav,.webm"
                    className="text-sm"
                  />
                </label>
                {audioTooBig || saveState.error ? (
                  <p className="text-sm text-destructive">{t(audioTooBig ? "audio" : saveState.error)}</p>
                ) : null}
                <Button type="submit" disabled={saving} className="self-start">
                  {saving ? t("saving") : t("save")}
                </Button>
              </form>
              <MediaUploader storyId={story.id} quiet />
              <form action={deleteStory}>
                <input type="hidden" name="id" value={story.id} />
                <Button type="submit" variant="destructive">
                  {t("delete")}
                </Button>
              </form>
            </>
          ) : null}
        </TabsContent>
        <TabsContent value="words" className="flex flex-col gap-3 text-base">
          {editingTab === "words" ? (
            <WordPicker key={story.words.map((word) => `${word.id}:${word.label}`).join()} storyId={story.id} words={story.words} />
          ) : story.words.length > 0 ? (
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
          {editingTab === "quiz" ? (
            <QuizEditor key={story.updatedAt} storyId={story.id} questions={story.questions} />
          ) : questions.length > 0 ? (
            <StoryQuiz storyId={story.id} questions={questions} bare />
          ) : (
            <p className="text-sm text-muted-foreground">{t("emptyQuiz")}</p>
          )}
        </TabsContent>
        {learnOpen ? (
          <TabsContent value="learn" className="text-base">
            {editingTab === "learn" ? (
              <StoryLearnEditor
                key={`${story.updatedAt}:${story.lesson.title.en}:${story.lesson.levels.map((level) => level.id).join()}`}
                storyId={story.id}
                lesson={story.lesson}
                catalog={catalog}
              />
            ) : (
              <StoryLearn lesson={story.lesson} />
            )}
          </TabsContent>
        ) : null}
      </Tabs>
    </article>
  );
}
