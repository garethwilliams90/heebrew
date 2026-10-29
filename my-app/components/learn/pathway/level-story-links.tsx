"use client";

import { useTranslations } from "next-intl";
import { JumpLink } from "@/components/learn/pathway/jump-link";
import { isolateHebrew } from "@/lib/learn/hebrew-text";
import type { LevelStoryLink } from "@/lib/stories/queries";

export function LevelStoryLinks({ stories }: { stories: LevelStoryLink[] }) {
  const t = useTranslations("Learn");
  if (stories.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      {stories.map((story) => (
        <JumpLink
          key={story.id}
          href={`/stories?story=${story.id}&tab=learn`}
          label={t("storyAlso", { story: isolateHebrew(story.title) })}
        />
      ))}
    </div>
  );
}
