"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { savePost, type PostActionState } from "@/lib/blog/actions";
import type { PostView } from "@/lib/blog/queries";

const initial: PostActionState = { error: "" };

export function PostEditor({ post }: { post?: PostView }) {
  const t = useTranslations("Blog");
  const [state, action, pending] = useActionState(savePost, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={post ? `post-title-${post.id}` : "post-title"}>{t("titleLabel")}</FieldLabel>
          <Input id={post ? `post-title-${post.id}` : "post-title"} name="title" required maxLength={160} defaultValue={post?.title ?? ""} />
        </Field>
        <Field>
          <FieldLabel htmlFor={post ? `post-body-${post.id}` : "post-body"}>{t("bodyLabel")}</FieldLabel>
          <Textarea id={post ? `post-body-${post.id}` : "post-body"} name="body" required maxLength={20000} defaultValue={post?.body ?? ""} />
        </Field>
        <Field orientation="horizontal">
          <input id={post ? `post-published-${post.id}` : "post-published"} type="checkbox" name="published" value="true" defaultChecked={post?.published ?? false} />
          <FieldLabel htmlFor={post ? `post-published-${post.id}` : "post-published"}>{t("publish")}</FieldLabel>
        </Field>
      </FieldGroup>
      {state.error ? <p className="text-sm text-destructive">{t(state.error)}</p> : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
