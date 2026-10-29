"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RouteSkeleton } from "@/components/loading/route-skeleton";
import { ReviewPrompt } from "@/components/learn/pathway/review-prompt";
import { PathwaySectionView } from "@/components/learn/pathway/pathway-section";
import { levelIsOpen, needsReview, PATHWAY_EVENT, readProgress, sectionIsOpen, type PathwayProgress } from "@/lib/learn/pathway/progress";
import { glossOf } from "@/lib/learn/sentences";
import type { PathwaySectionOutline } from "@/lib/learn/pathway/types";

export function LevelPath({ outline }: { outline: readonly PathwaySectionOutline[] }) {
  const locale = useLocale();
  const loading = useTranslations("Settings");
  const [progress, setProgress] = useState<PathwayProgress | null>(null);
  const [hideReview, setHideReview] = useState(false);

  useEffect(() => {
    function refresh() {
      setProgress(readProgress());
    }
    refresh();
    window.addEventListener(PATHWAY_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PATHWAY_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!progress) {
    return <RouteSkeleton kind="path" label={loading("loading")} />;
  }

  const reviewId = needsReview(progress) ? progress.lastSectionId : null;
  const reviewSection = reviewId ? outline.find((section) => section.id === reviewId) : null;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-8 overflow-x-clip px-3" dir="rtl">
      {outline.map((section, index) => {
        const previous = outline[index - 1];
        return (
          <PathwaySectionView
            key={section.id}
            section={section}
            open={sectionIsOpen(section.index, progress)}
            previousExamHref={previous?.hasExam ? `/learn?section=${previous.id}&exam=1` : undefined}
            levelOpen={(levelId) => levelIsOpen(levelId, progress)}
            startIndex={outline.slice(0, index).reduce((sum, item) => sum + item.levels.length, 0)}
          />
        );
      })}
      {reviewSection && !hideReview ? (
        <ReviewPrompt
          title={glossOf(reviewSection.title, locale)}
          href={`/learn?section=${reviewSection.id}&review=1`}
          onLater={() => setHideReview(true)}
        />
      ) : null}
    </div>
  );
}
