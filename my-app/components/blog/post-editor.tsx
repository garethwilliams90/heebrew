"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { savePost, type PostActionState } from "@/lib/blog/actions";
import type { PostView } from "@/lib/blog/queries";

const initial: PostActionState = { error: "" };

const fieldClass =
  "w-full rounded-lg border border-emerald-950/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30";

export function PostEditor({ post }: { post?: PostView }) {
  const t = useTranslations("Blog");
  const [state, action, pending] = useActionState(savePost, initial);

  return (
    <form action={action} className="flex flex-col gap-3">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("titleLabel")}
        <input className={fieldClass} name="title" required maxLength={160} defaultValue={post?.title ?? ""} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("bodyLabel")}
        <textarea className={`${fieldClass} min-h-40`} name="body" required maxLength={20000} defaultValue={post?.body ?? ""} />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="published" value="true" defaultChecked={post?.published ?? false} />
        {t("publish")}
      </label>
      {state.error ? <p className="text-sm text-red-800">{t(state.error)}</p> : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
