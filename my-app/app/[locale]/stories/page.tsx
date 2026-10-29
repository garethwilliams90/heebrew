import { StoriesView } from "@/components/stories/stories-view";
import { pathwayLessonCatalog } from "@/lib/learn/pathway/lesson-links";
import { loadStories, parseStoryLevel, parseStoryTab } from "@/lib/stories/queries";

export const maxDuration = 60;

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; story?: string; tab?: string }>;
}) {
  const { level, story, tab } = await searchParams;
  const selected = parseStoryLevel(level);
  const { owner, signedIn, stories } = await loadStories(selected);
  const focusStory = stories.some((item) => item.id === story) ? story ?? "" : "";
  return (
    <StoriesView
      level={selected}
      owner={owner}
      signedIn={signedIn}
      stories={stories}
      catalog={owner ? pathwayLessonCatalog() : []}
      focusStory={focusStory}
      startTab={parseStoryTab(tab)}
    />
  );
}
