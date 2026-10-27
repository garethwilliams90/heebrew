"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Languages, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { MediaGallery } from "@/components/content/media-gallery";
import { MediaUploader } from "@/components/content/media-uploader";
import { Fold } from "@/components/stories/fold";
import { StoryEditor } from "@/components/stories/story-editor";
import { StoryMarks } from "@/components/stories/story-marks";
import { StoryPlayer } from "@/components/stories/story-player";
import { QuizEditor, StoryQuiz } from "@/components/stories/story-quiz";
import { WordPicker } from "@/components/stories/word-picker";
import { Button } from "@/components/ui/button";
import { deleteStory } from "@/lib/stories/actions";
import { pairedTranscript } from "@/lib/stories/lines";
import type { StoryDetail, WordView } from "@/lib/stories/queries";
import { cn } from "cn";

const panel = "rounded-3xl border border-emerald-950/10 bg-white/90 p-5 text-emerald-950 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)]";

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
  const [editing, setEditing] = useState(false);
  const [studying, setStudying] = useState(false);
  const [glossOn, setGlossOn] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [wordsOpen, setWordsOpen] = useState(false);
  const lines = pairedTranscript(story.hebrew, gloss);
  const questions = story.questions.map((question) => ({
    ...question,
    choices: question.choices.map((choice) => ({ ...choice, correct: false })),
  }));
  const canStudy = questions.length > 0 || story.words.length > 0;

  function captureSelection() {
    const selected = window.getSelection()?.toString().replace(/\s+/g, " ").trim() ?? "";
    if (selected && story.hebrew.replace(/\s+/g, " ").includes(selected)) {
      setPhrase(selected);
      setWordsOpen(true);
    }
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
          {!editing && !studying ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-pressed={glossOn}
              aria-label={glossOn ? t("hideGloss") : t("showGloss")}
              className={glossOn ? "border-blue-200 bg-blue-50 text-blue-800" : undefined}
              onClick={() => setGlossOn((on) => !on)}
            >
              <Languages />
            </Button>
          ) : null}
          {owner ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-pressed={editing}
              aria-label={t("edit")}
              onClick={() => {
                setEditing((on) => !on);
                setStudying(false);
              }}
            >
              <Pencil />
            </Button>
          ) : null}
        </div>
      </div>
      {story.published ? (
        <StoryMarks storyId={story.id} signedIn={signedIn} hearted={story.hearted} completed={story.completed} />
      ) : null}
      {story.audioUrl ? <StoryPlayer src={story.audioUrl} /> : <p className="mt-4 text-sm text-emerald-900/70">{t("audioMissing")}</p>}
      {studying ? (
        <StoryStudy storyId={story.id} questions={questions} words={story.words} onBack={() => setStudying(false)} />
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-4" onMouseUp={editing ? captureSelection : undefined} onKeyUp={editing ? captureSelection : undefined}>
            {lines.map((line, index) => (
              <div key={`${index}:${line.hebrew}`}>
                <p dir="rtl" lang="he" translate="no" className={cn(printFont.className, "text-2xl leading-relaxed")}>
                  {line.hebrew}
                </p>
                {glossOn && line.gloss ? <p className="mt-1 text-base text-blue-700 italic">{line.gloss}</p> : null}
              </div>
            ))}
          </div>
          <MediaGallery items={story.media} owner={editing} />
          {canStudy && !editing ? (
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={() => setStudying(true)}>
                {t("nextStudy")}
                <ChevronRight />
              </Button>
            </div>
          ) : null}
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
        </>
      )}
    </article>
  );
}

function StoryStudy({
  storyId,
  questions,
  words,
  onBack,
}: {
  storyId: string;
  questions: StoryDetail["questions"];
  words: WordView[];
  onBack: () => void;
}) {
  const t = useTranslations("Stories");

  return (
    <div className="mt-6 flex flex-col gap-8">
      {questions.length > 0 ? <StoryQuiz storyId={storyId} questions={questions} /> : null}
      {words.length > 0 ? <WordStudy words={words} /> : null}
      <Button type="button" variant="outline" className="self-start" onClick={onBack}>
        <ChevronLeft />
        {t("backToStory")}
      </Button>
    </div>
  );
}

function WordStudy({ words }: { words: WordView[] }) {
  const t = useTranslations("Stories");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const word = words[index];
  if (!word) {
    return null;
  }

  function move(next: number) {
    setIndex(next);
    setRevealed(false);
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-emerald-800">{t("studyCards")}</h3>
      <button
        type="button"
        className="rounded-2xl border border-emerald-950/10 bg-emerald-50/70 px-4 py-6 text-center"
        aria-pressed={revealed}
        aria-label={revealed ? t("hideCard") : t("revealCard")}
        onClick={() => setRevealed((on) => !on)}
      >
        <p dir="rtl" lang="he" translate="no" className={cn(printFont.className, "text-3xl")}>
          {word.phrase}
        </p>
        {revealed ? <p className="mt-2 text-base text-blue-700 italic">{word.label}</p> : null}
      </button>
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" size="icon" aria-label={t("previousCard")} disabled={index === 0} onClick={() => move(index - 1)}>
          <ChevronLeft />
        </Button>
        <p className="text-sm text-emerald-900/70">{t("cardOf", { current: index + 1, total: words.length })}</p>
        <Button type="button" variant="outline" size="icon" aria-label={t("nextCard")} disabled={index === words.length - 1} onClick={() => move(index + 1)}>
          <ChevronRight />
        </Button>
      </div>
    </section>
  );
}
