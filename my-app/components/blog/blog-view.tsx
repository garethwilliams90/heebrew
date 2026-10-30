import { getTranslations } from "next-intl/server";
import { OwnerEditor } from "@/components/blog/owner-editor";
import { MediaGallery } from "@/components/content/media-gallery";
import { MediaUploader, PostEditor } from "@/components/content/lazy-owner-tools";
import { KofiSupport } from "@/components/support/kofi-support";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { deletePost } from "@/lib/blog/actions";
import type { PostView } from "@/lib/blog/queries";

export async function BlogView({ owner, posts }: { owner: boolean; posts: PostView[] }) {
  const t = await getTranslations("Blog");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-emerald-900/80">{t("description")}</p>
        </div>
        <KofiSupport variant="label" />
      </header>
      {owner ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("ownerTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">{t("ownerHint")}</p>
            <OwnerEditor label={t("ownerTitle")}>
              <PostEditor />
            </OwnerEditor>
          </CardContent>
        </Card>
      ) : null}
      {posts.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : null}
      <ul className="flex flex-col gap-3">
        {posts.map((post) => (
          <li key={post.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  {owner && !post.published ? <Badge variant="secondary">{t("draft")}</Badge> : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <MediaGallery items={post.media} owner={owner} />
                {owner ? (
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
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
