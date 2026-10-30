import { getTranslations } from "next-intl/server";
import { OwnerEditor } from "@/components/blog/owner-editor";
import { MediaGallery } from "@/components/content/media-gallery";
import { MediaUploader, PostEditor } from "@/components/content/lazy-owner-tools";
import { KofiSupport } from "@/components/support/kofi-support";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { deletePost } from "@/lib/blog/actions";
import type { PostView } from "@/lib/blog/queries";

export async function BlogArticle({ owner, post }: { owner: boolean; post: PostView }) {
  const t = await getTranslations("Blog");
  const paragraphs = post.body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/blog" className="text-sm font-medium text-emerald-800 hover:underline">
          {t("back")}
        </Link>
        <KofiSupport variant="label" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-3xl">
            {post.title}
            {owner && !post.published ? <Badge variant="secondary">{t("draft")}</Badge> : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-base leading-relaxed">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
          <MediaGallery items={post.media} owner={owner} />
          {owner ? (
            <>
              <Separator />
              <OwnerEditor label={t("edit")}>
                <MediaUploader postId={post.id} quiet />
                <PostEditor key={`${post.id}:${post.updatedAt}`} post={post} />
                <form action={deletePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <Button type="submit" variant="destructive">
                    {t("delete")}
                  </Button>
                </form>
              </OwnerEditor>
            </>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
