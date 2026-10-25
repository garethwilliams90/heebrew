"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ReviewPrompt } from "@/components/learn/pathway/section-exam";
import { PathwaySectionView } from "@/components/learn/pathway/pathway-section";
import { pathwaySections, sectionById } from "@/lib/learn/pathway/catalog";
import { levelIsOpen, needsReview, PATHWAY_EVENT, readProgress, sectionIsOpen, type PathwayProgress } from "@/lib/learn/pathway/progress";
import { glossOf } from "@/lib/learn/sentences";

export function LevelPath() {
  const locale = useLocale();
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
    return null;
  }

  const reviewId = needsReview(progress) ? progress.lastSectionId : null;
  const reviewSection = reviewId ? sectionById(reviewId) : null;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-8 overflow-x-clip px-3" dir="rtl">
      {pathwaySections.map((section, index) => {
        const previous = pathwaySections[index - 1];
        return (
          <PathwaySectionView
            key={section.id}
            section={section}
            open={sectionIsOpen(section.index, progress)}
            previousExamHref={previous ? `/learn?section=${previous.id}&exam=1` : undefined}
            levelOpen={(levelId) => levelIsOpen(levelId, progress)}
            startIndex={pathwaySections.slice(0, index).reduce((sum, item) => sum + item.levels.length, 0)}
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
