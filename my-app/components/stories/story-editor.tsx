"use client";

import { useActionState, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveStory, type StoryActionState } from "@/lib/stories/actions";
import { STORY_AUDIO_MAX_BYTES } from "@/lib/stories/audio";
import type { StoryView } from "@/lib/stories/queries";

const initial: StoryActionState = { error: "" };

export function StoryEditor({ story }: { story?: StoryView }) {
  const t = useTranslations("Stories");
  const [state, action, pending] = useActionState(saveStory, initial);
  const [tooBig, setTooBig] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const file = new FormData(event.currentTarget).get("audio");
    const oversized = file instanceof File && file.size > STORY_AUDIO_MAX_BYTES;
    setTooBig(oversized);
    if (oversized) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} className="flex flex-col gap-4" onSubmit={onSubmit}>
      {story ? <input type="hidden" name="id" value={story.id} /> : null}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="story-title">{t("titleLabel")}</FieldLabel>
          <Input id="story-title" name="title" required maxLength={120} defaultValue={story?.title ?? ""} />
        </Field>
        <Field>
          <FieldLabel htmlFor="story-level">{t("levelLabel")}</FieldLabel>
          <select
            id="story-level"
            name="level"
            defaultValue={story?.level ?? "beginner"}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="beginner">{t("beginner")}</option>
            <option value="intermediate">{t("intermediate")}</option>
            <option value="advanced">{t("advanced")}</option>
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="story-hebrew">{t("hebrewLabel")}</FieldLabel>
          <Textarea id="story-hebrew" name="hebrew" required={Boolean(story)} maxLength={20000} dir="rtl" lang="he" defaultValue={story?.hebrew ?? ""} />
        </Field>
        {story ? (
          <>
            <Field>
              <FieldLabel htmlFor="story-en">{t("enLabel")}</FieldLabel>
              <Textarea id="story-en" name="transcriptEn" maxLength={20000} defaultValue={story.gloss.en} />
            </Field>
            <Field>
              <FieldLabel htmlFor="story-fr">{t("frLabel")}</FieldLabel>
              <Textarea id="story-fr" name="transcriptFr" maxLength={20000} defaultValue={story.gloss.fr} />
            </Field>
            <Field>
              <FieldLabel htmlFor="story-es">{t("esLabel")}</FieldLabel>
              <Textarea id="story-es" name="transcriptEs" maxLength={20000} defaultValue={story.gloss.es} />
            </Field>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t("pasteHint")}</p>
        )}
        <Field>
          <FieldLabel htmlFor="story-audio">{story ? t("audioReplace") : t("audioLabel")}</FieldLabel>
          <Input id="story-audio" type="file" name="audio" accept="audio/mpeg,audio/mp4,audio/wav,audio/webm,.mp3,.m4a,.wav,.webm" required={!story} />
        </Field>
        {story ? (
          <Field orientation="horizontal">
            <input id="story-regenerate" type="checkbox" name="regenerate" value="true" />
            <FieldLabel htmlFor="story-regenerate">{t("regenerate")}</FieldLabel>
          </Field>
        ) : null}
        <Field orientation="horizontal">
          <input id="story-published" type="checkbox" name="published" value="true" defaultChecked={story?.published ?? false} />
          <FieldLabel htmlFor="story-published">{t("publish")}</FieldLabel>
        </Field>
      </FieldGroup>
      {tooBig || state.error ? <p className="text-sm text-destructive">{t(tooBig ? "audio" : state.error)}</p> : null}
      {story ? (
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? t("saving") : t("save")}
        </Button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="submit" name="intent" value="save" disabled={pending}>
            {pending ? t("saving") : t("save")}
          </Button>
          <Button type="submit" name="intent" value="generate" variant="outline" disabled={pending}>
            {pending ? t("generating") : t("generate")}
          </Button>
        </div>
      )}
    </form>
  );
}
