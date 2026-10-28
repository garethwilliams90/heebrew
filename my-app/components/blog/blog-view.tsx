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
        <section className={panel}>
          <h2 className="text-lg font-semibold">{t("ownerTitle")}</h2>
          <p className="mt-1 mb-4 text-sm text-emerald-900/70">{t("ownerHint")}</p>
          <PostEditor />
        </section>
      ) : null}
      {posts.length === 0 ? <p className="text-sm text-emerald-900/70">{t("empty")}</p> : null}
      <ul className="flex flex-col gap-3">
        {posts.map((post) => (
          <li key={post.id} className={panel}>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              {owner && !post.published ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-950">{t("draft")}</span>
              ) : null}
            </div>
            <MediaGallery items={post.media} owner={owner} />
            {owner ? (
              <>
                <MediaUploader postId={post.id} />
                <form action={deletePost} className="mt-4">
                  <input type="hidden" name="id" value={post.id} />
                  <Button type="submit" variant="destructive">
                    {t("delete")}
                  </Button>
                </form>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
