import { getTranslations } from "next-intl/server";
import { MediaGallery } from "@/components/content/media-gallery";
import { MediaUploader } from "@/components/content/media-uploader";
import { PostEditor } from "@/components/blog/post-editor";
import { KofiSupport } from "@/components/support/kofi-support";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { deletePost } from "@/lib/blog/actions";
import type { PostView } from "@/lib/blog/queries";

const panel = "rounded-3xl border border-emerald-950/10 bg-white/90 p-5 text-emerald-950 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)]";

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
      <article className={panel}>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
          {owner && !post.published ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-950">{t("draft")}</span>
          ) : null}
        </div>
        <div className="mt-4 flex flex-col gap-4 leading-relaxed">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>
        <MediaGallery items={post.media} owner={owner} />
        {owner ? <MediaUploader postId={post.id} /> : null}
        {owner ? (
          <div className="mt-6 flex flex-col gap-4 border-t border-emerald-950/10 pt-4">
            <h2 className="text-lg font-semibold">{t("edit")}</h2>
            <PostEditor key={`${post.id}:${post.updatedAt}`} post={post} />
            <form action={deletePost}>
              <input type="hidden" name="id" value={post.id} />
              <Button type="submit" variant="destructive">
                {t("delete")}
              </Button>
            </form>
          </div>
        ) : null}
      </article>
    </main>
  );
}
