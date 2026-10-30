"use client";

import { useLocale, useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { JumpLink } from "@/components/learn/pathway/jump-link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PathwayLevelRef } from "@/lib/learn/pathway/lesson-links";
import { isolateHebrew } from "@/lib/learn/hebrew-text";
import { glossOf } from "@/lib/learn/sentences";
import { lessonIsVisible } from "@/lib/stories/lesson-model";
import type { StoryLesson } from "@/lib/stories/queries";
import { cn } from "cn";

function levelName(level: PathwayLevelRef, locale: string) {
  return `${level.badge} · ${glossOf(level.title, locale)}`;
}

export function StoryLearn({ lesson }: { lesson: StoryLesson }) {
  const t = useTranslations("Stories");
  const locale = useLocale();
  const visible = lessonIsVisible(lesson);
  const concept = glossOf(lesson.concept, locale);

  return (
    <div className="flex flex-col gap-4">
      {visible ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{t("learnConcept")}</p>
            <div className="flex flex-wrap items-baseline gap-3">
              {lesson.conceptHe ? (
                <p dir="rtl" lang="he" translate="no" className={cn(printFont.className, "text-3xl leading-none")}>
                  {lesson.conceptHe}
                </p>
              ) : null}
              {concept ? <p className="text-lg">{concept}</p> : null}
            </div>
          </div>
          <h3 className="text-xl font-semibold">{glossOf(lesson.title, locale)}</h3>
          <div className="flex max-w-2xl flex-col gap-3 text-base leading-relaxed">
            {glossOf(lesson.body, locale)
              .split("\n")
              .map((line, index) => {
                if (/^-{3,}$/.test(line.trim())) {
                  return <Separator key={`rule-${index}`} />;
                }
                if (!line.trim()) {
                  return null;
                }
                return <p key={`${index}:${line}`}>{line}</p>;
              })}
          </div>
          {lesson.examples.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium text-muted-foreground">{t("learnExamples")}</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {lesson.examples.map((example) => (
                  <Card key={`${example.hebrew}:${glossOf(example.gloss, locale)}`} size="sm">
                    <CardContent className="flex flex-col gap-1">
                      <CardTitle dir="rtl" lang="he" translate="no" className={cn(printFont.className, "text-2xl")}>
                        {example.hebrew}
                      </CardTitle>
                      <CardDescription>{glossOf(example.gloss, locale)}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("learnEmpty")}</p>
      )}
      {lesson.levels.length > 0 ? (
        <>
          {visible ? <Separator /> : null}
          <div className="flex flex-col gap-2">
            {lesson.levels.map((level) => (
              <JumpLink
                key={level.id}
                href={level.href}
                label={t("levelAlso", {
                  level: isolateHebrew(levelName(level, locale)),
                  badge: isolateHebrew(level.badge),
                })}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
