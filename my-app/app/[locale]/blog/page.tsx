import { BlogView } from "@/components/blog/blog-view";
import { loadPosts } from "@/lib/blog/queries";

export default async function BlogPage() {
  const { owner, posts } = await loadPosts();
  return <BlogView owner={owner} posts={posts} />;
}
