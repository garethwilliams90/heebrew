"use client";

import { useState, useTransition } from "react";
import { CircleCheck, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePlaySample } from "@/components/settings/settings-provider";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { toggleComplete, toggleHeart } from "@/lib/stories/engagement";

export function StoryMarks({
  storyId,
  signedIn,
  hearted,
  completed,
}: {
  storyId: string;
  signedIn: boolean;
  hearted: boolean;
  completed: boolean;
}) {
  const t = useTranslations("Stories");
  const play = usePlaySample();
  const [heartOn, setHeartOn] = useState(hearted);
  const [done, setDone] = useState(completed);
  const [pending, start] = useTransition();

  if (!signedIn) {
    return (
      <div className="flex gap-2">
        <Button asChild variant="outline" size="icon" sound={false}>
          <Link href="/login" aria-label={t("signInToSave")}>
            <Heart />
          </Link>
        </Button>
        <Button asChild variant="outline" size="icon" sound={false}>
          <Link href="/login" aria-label={t("signInToSave")}>
            <CircleCheck />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        sound={false}
        aria-pressed={heartOn}
        aria-label={heartOn ? t("hearted") : t("heart")}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const next = await toggleHeart(storyId);
            if (typeof next !== "boolean") {
              return;
            }
            setHeartOn(next);
            play(next ? "success" : "popDown");
          })
        }
      >
        <Heart className={heartOn ? "fill-rose-500 text-rose-500" : undefined} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        sound={false}
        aria-pressed={done}
        aria-label={done ? t("completed") : t("complete")}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const next = await toggleComplete(storyId);
            if (typeof next !== "boolean") {
              return;
            }
            setDone(next);
            play(next ? "success" : "popDown");
          })
        }
      >
        <CircleCheck className={done ? "text-emerald-700" : undefined} />
      </Button>
    </div>
  );
}
