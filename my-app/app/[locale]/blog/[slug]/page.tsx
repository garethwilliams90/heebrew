import { BlogArticle } from "@/components/blog/post-view";
import { loadPost } from "@/lib/blog/queries";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { owner, post } = await loadPost(slug);
  return <BlogArticle owner={owner} post={post} />;
}
