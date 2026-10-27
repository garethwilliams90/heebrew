"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { saveStory, type StoryActionState } from "@/lib/stories/actions";
import type { StoryView } from "@/lib/stories/queries";

const initial: StoryActionState = { error: "" };

const fieldClass =
  "w-full rounded-lg border border-emerald-950/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30";

export function StoryEditor({ story }: { story?: StoryView }) {
  const t = useTranslations("Stories");
  const [state, action, pending] = useActionState(saveStory, initial);

  return (
    <form action={action} className="flex flex-col gap-3">
      {story ? <input type="hidden" name="id" value={story.id} /> : null}
      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("titleLabel")}
        <input className={fieldClass} name="title" required maxLength={120} defaultValue={story?.title ?? ""} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("levelLabel")}
        <select className={fieldClass} name="level" defaultValue={story?.level ?? "beginner"}>
          <option value="beginner">{t("beginner")}</option>
          <option value="intermediate">{t("intermediate")}</option>
          <option value="advanced">{t("advanced")}</option>
        </select>
      </label>
      {story ? (
        <>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("hebrewLabel")}
            <textarea
              className={`${fieldClass} min-h-28`}
              name="hebrew"
              required
              maxLength={20000}
              dir="rtl"
              lang="he"
              defaultValue={story.hebrew}
            />
          </label>
          <p className="text-sm text-emerald-900/70">{t("translationHint")}</p>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("enLabel")}
            <textarea className={`${fieldClass} min-h-20`} name="transcriptEn" maxLength={20000} defaultValue={story.gloss.en} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("frLabel")}
            <textarea className={`${fieldClass} min-h-20`} name="transcriptFr" maxLength={20000} defaultValue={story.gloss.fr} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("esLabel")}
            <textarea className={`${fieldClass} min-h-20`} name="transcriptEs" maxLength={20000} defaultValue={story.gloss.es} />
          </label>
        </>
      ) : (
        <>
          <p className="text-sm text-emerald-900/70">{t("pasteHint")}</p>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("hebrewLabel")}
            <textarea className={`${fieldClass} min-h-28`} name="hebrew" maxLength={20000} dir="rtl" lang="he" />
          </label>
        </>
      )}
      <label className="flex flex-col gap-1 text-sm font-medium">
        {story ? t("audioReplace") : t("audioLabel")}
        <input
          className={fieldClass}
          type="file"
          name="audio"
          accept="audio/mpeg,audio/mp4,audio/wav,audio/webm,.mp3,.m4a,.wav,.webm"
          required={!story}
        />
      </label>
      {story ? (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="regenerate" value="true" />
          {t("regenerate")}
        </label>
      ) : null}
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="published" value="true" defaultChecked={story?.published ?? false} />
        {t("publish")}
      </label>
      {state.error ? <p className="text-sm text-red-800">{t(state.error)}</p> : null}
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
