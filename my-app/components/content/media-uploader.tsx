"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { addMedia, type MediaActionState } from "@/lib/content/media-actions";

const initial: MediaActionState = { error: "" };

const fieldClass =
  "w-full rounded-lg border border-emerald-950/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30";

export function MediaUploader({
  storyId,
  postId,
  bare = false,
  quiet = false,
}: {
  storyId?: string;
  postId?: string;
  bare?: boolean;
  quiet?: boolean;
}) {
  const t = useTranslations("Media");
  const [state, action, pending] = useActionState(addMedia, initial);

  return (
    <form action={action} className={bare ? "flex flex-col gap-3" : "mt-4 flex flex-col gap-3 border-t border-emerald-950/10 pt-4"}>
      {bare || quiet ? null : <h3 className="text-sm font-medium">{t("title")}</h3>}
      {quiet ? null : <p className="text-sm text-emerald-900/70">{t("hint")}</p>}
      {storyId ? <input type="hidden" name="storyId" value={storyId} /> : null}
      {postId ? <input type="hidden" name="postId" value={postId} /> : null}
      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("file")}
        <input className={fieldClass} type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm" required />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("alt")}
        <input className={fieldClass} name="alt" maxLength={200} />
      </label>
      {state.error ? <p className="text-sm text-red-800">{t(state.error === "media" ? "invalid" : state.error)}</p> : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t("adding") : t("add")}
      </Button>
    </form>
  );
}
