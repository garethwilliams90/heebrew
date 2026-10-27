import { StoriesView } from "@/components/stories/stories-view";
import { loadStories, parseStoryLevel } from "@/lib/stories/queries";

export const maxDuration = 60;

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const selected = parseStoryLevel(level);
  const { owner, signedIn, stories } = await loadStories(selected);
  return <StoriesView level={selected} owner={owner} signedIn={signedIn} stories={stories} />;
}
