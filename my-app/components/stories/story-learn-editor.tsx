"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { Fold } from "@/components/stories/fold";
import { ink } from "@/components/stories/ink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import type { PathwayLessonSection } from "@/lib/learn/pathway/lesson-links";
import { glossOf } from "@/lib/learn/sentences";
import { saveStoryLesson, type LessonActionState } from "@/lib/stories/lesson";
import type { StoryLesson } from "@/lib/stories/queries";
import { cn } from "cn";

const initial: LessonActionState = { error: "" };

type ExampleDraft = { hebrew: string; en: string; fr: string; es: string };

type Draft = {
  conceptHe: string;
  conceptEn: string;
  conceptFr: string;
  conceptEs: string;
  titleEn: string;
  titleFr: string;
  titleEs: string;
  bodyEn: string;
  bodyFr: string;
  bodyEs: string;
  examples: ExampleDraft[];
  levelIds: string[];
};

function fromLesson(lesson: StoryLesson): Draft {
  return {
    conceptHe: lesson.conceptHe,
    conceptEn: lesson.concept.en,
    conceptFr: lesson.concept.fr,
    conceptEs: lesson.concept.es,
    titleEn: lesson.title.en,
    titleFr: lesson.title.fr,
    titleEs: lesson.title.es,
    bodyEn: lesson.body.en,
    bodyFr: lesson.body.fr,
    bodyEs: lesson.body.es,
    examples: lesson.examples.map((example) => ({
      hebrew: example.hebrew,
      en: example.gloss.en,
      fr: example.gloss.fr,
      es: example.gloss.es,
    })),
    levelIds: lesson.levels.map((level) => level.id),
  };
}

export function StoryLearnEditor({
  storyId,
  lesson,
  catalog,
}: {
  storyId: string;
  lesson: StoryLesson;
  catalog: PathwayLessonSection[];
}) {
  const t = useTranslations("Stories");
  const locale = useLocale();
  const [draft, setDraft] = useState<Draft>(() => fromLesson(lesson));
  const [state, action, pending] = useActionState(saveStoryLesson, initial);

  function patch(next: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function patchExample(index: number, next: Partial<ExampleDraft>) {
    setDraft((current) => ({
      ...current,
      examples: current.examples.map((example, exampleIndex) => (exampleIndex === index ? { ...example, ...next } : example)),
    }));
  }

  function toggleLevel(id: string, on: boolean) {
    setDraft((current) => ({
      ...current,
      levelIds: on
        ? current.levelIds.includes(id)
          ? current.levelIds
          : [...current.levelIds, id]
        : current.levelIds.filter((levelId) => levelId !== id),
    }));
  }

  const copy = locale === "fr" ? "fr" : locale === "es" ? "es" : "en";
  const concept = copy === "fr" ? draft.conceptFr : copy === "es" ? draft.conceptEs : draft.conceptEn;
  const title = copy === "fr" ? draft.titleFr : copy === "es" ? draft.titleEs : draft.titleEn;
  const body = copy === "fr" ? draft.bodyFr : copy === "es" ? draft.bodyEs : draft.bodyEn;

  function setCopy(kind: "concept" | "title" | "body", value: string) {
    if (copy === "fr") {
      patch(kind === "concept" ? { conceptFr: value } : kind === "title" ? { titleFr: value } : { bodyFr: value });
      return;
    }
    if (copy === "es") {
      patch(kind === "concept" ? { conceptEs: value } : kind === "title" ? { titleEs: value } : { bodyEs: value });
      return;
    }
    if (kind === "concept") {
      patch({ conceptEn: value, conceptFr: "", conceptEs: "" });
      return;
    }
    if (kind === "title") {
      patch({ titleEn: value, titleFr: "", titleEs: "" });
      return;
    }
    patch({ bodyEn: value, bodyFr: "", bodyEs: "" });
  }

  function exampleGloss(example: ExampleDraft) {
    if (copy === "fr") {
      return example.fr;
    }
    if (copy === "es") {
      return example.es;
    }
    return example.en;
  }

  function setExampleGloss(index: number, value: string) {
    if (copy === "fr") {
      patchExample(index, { fr: value });
      return;
    }
    if (copy === "es") {
      patchExample(index, { es: value });
      return;
    }
    patchExample(index, { en: value, fr: "", es: "" });
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="storyId" value={storyId} />
      <input type="hidden" name="lesson" value={JSON.stringify(draft)} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{t("learnConcept")}</p>
          <div className="flex flex-wrap items-baseline gap-3">
            <input
              dir="rtl"
              lang="he"
              translate="no"
              className={cn(ink, printFont.className, "w-auto text-3xl leading-none")}
              value={draft.conceptHe}
              maxLength={80}
              aria-label={t("conceptHebrew")}
              onChange={(event) => patch({ conceptHe: event.target.value })}
            />
            <input
              className={cn(ink, "w-auto text-lg")}
              value={concept}
              maxLength={120}
              aria-label={t("conceptLabel")}
              onChange={(event) => setCopy("concept", event.target.value)}
            />
          </div>
        </div>
        <input
          className={cn(ink, "text-xl font-semibold")}
          value={title}
          maxLength={160}
          aria-label={t("lessonTitleLabel")}
          onChange={(event) => setCopy("title", event.target.value)}
        />
        <textarea
          className={cn(ink, "field-sizing-content max-w-2xl text-base leading-relaxed")}
          value={body}
          maxLength={8000}
          rows={4}
          aria-label={t("lessonBodyLabel")}
          onChange={(event) => setCopy("body", event.target.value)}
        />
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-muted-foreground">{t("learnExamples")}</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {draft.examples.map((example, index) => (
              <Card key={index} size="sm">
                <CardContent className="flex flex-col gap-2">
                  <input
                    dir="rtl"
                    lang="he"
                    translate="no"
                    className={cn(ink, printFont.className, "text-2xl")}
                    value={example.hebrew}
                    maxLength={200}
                    aria-label={t("exampleHebrew")}
                    onChange={(event) => patchExample(index, { hebrew: event.target.value })}
                  />
                  <input
                    className={cn(ink, "text-sm text-muted-foreground")}
                    value={exampleGloss(example)}
                    maxLength={400}
                    aria-label={t("exampleGloss")}
                    onChange={(event) => setExampleGloss(index, event.target.value)}
                  />
                  <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => patch({ examples: draft.examples.filter((_, item) => item !== index) })}>
                    {t("removeExample")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      {state.error ? <p className="text-sm text-destructive">{t(state.error)}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setCopy("body", `${body.replace(/\s*$/, "")}\n---\n`)}>
          {t("divider")}
        </Button>
        {draft.examples.length < 8 ? (
          <Button type="button" variant="outline" onClick={() => patch({ examples: [...draft.examples, { hebrew: "", en: "", fr: "", es: "" }] })}>
            {t("addExample")}
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : t("save")}
        </Button>
      </div>
      <Fold title={t("levelsTitle")}>
        <FieldSet>
          <FieldDescription>{t("levelsHint")}</FieldDescription>
          <div className="flex max-h-96 flex-col gap-5 overflow-y-auto">
            {catalog.map((section) => (
              <FieldSet key={section.id}>
                <FieldLegend variant="label">{glossOf(section.title, locale)}</FieldLegend>
                <div className="flex flex-col gap-3">
                  {section.levels.map((level) => {
                    const inputId = `level-${level.id}`;
                    return (
                      <Card key={level.id} size="sm">
                        <CardHeader>
                          <Field orientation="horizontal">
                            <Checkbox
                              id={inputId}
                              checked={draft.levelIds.includes(level.id)}
                              onCheckedChange={(checked) => toggleLevel(level.id, checked === true)}
                            />
                            <FieldContent>
                              <FieldLabel htmlFor={inputId}>
                                {level.badge} · {glossOf(level.title, locale)}
                              </FieldLabel>
                              <FieldDescription>{glossOf(level.about, locale)}</FieldDescription>
                            </FieldContent>
                          </Field>
                        </CardHeader>
                        {level.slides.length > 0 ? (
                          <CardContent className="flex flex-col gap-3">
                            {level.slides.map((slide, index) => (
                              <div key={`${level.id}:${index}`} className="flex flex-col gap-1">
                                <p className="text-sm font-medium">{glossOf(slide.title, locale)}</p>
                                <p className="line-clamp-3 text-sm text-muted-foreground">{glossOf(slide.body, locale)}</p>
                                {slide.samples.length > 0 ? (
                                  <p dir="rtl" lang="he" translate="no" className={cn(printFont.className, "text-lg")}>
                                    {slide.samples.join(" · ")}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                          </CardContent>
                        ) : null}
                      </Card>
                    );
                  })}
                </div>
              </FieldSet>
            ))}
          </div>
        </FieldSet>
      </Fold>
    </form>
  );
}
