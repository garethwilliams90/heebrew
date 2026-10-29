"use client";

import { useRef, useState } from "react";
import { CircleCheck, Heart } from "lucide-react";
import { animate, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import useSound from "use-sound";
import { useSettings } from "@/components/settings/settings-provider";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { lessonAudioUrl } from "@/lib/audio/lesson-audio";
import { toggleComplete, toggleHeart } from "@/lib/stories/engagement";

type MarkResult = boolean | "signed-out";

type Clip = {
  duration: () => number;
  once: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
};

function useClip(path: string, gain: number, sound: boolean, volume: number) {
  const audible = sound ? gain * volume : 0;
  const [play, { sound: clip }] = useSound(lessonAudioUrl(path), {
    interrupt: true,
    volume: audible,
    soundEnabled: audible > 0,
  });
  return { play, clip: clip as Clip | null, enabled: audible > 0 };
}

function playThrough(play: () => void, clip: Clip | null, enabled: boolean) {
  if (!enabled || !clip) {
    return Promise.resolve();
  }
  const seconds = clip.duration();
  if (!seconds) {
    play();
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      clip.off("end", finish);
      resolve();
    };
    clip.once("end", finish);
    play();
    window.setTimeout(finish, Math.ceil(seconds * 1000) + 50);
  });
}

async function popIcon(node: HTMLElement | null, reduce: boolean | null) {
  if (!node || reduce) {
    return;
  }
  node.style.willChange = "transform";
  try {
    await animate(node, { scale: 1.34 }, { type: "spring", bounce: 0.45, visualDuration: 0.22 });
    await animate(node, { scale: 1 }, { type: "spring", bounce: 0.28, visualDuration: 0.24 });
  } finally {
    node.style.willChange = "auto";
  }
}

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

  return <SignedMarks storyId={storyId} hearted={hearted} completed={completed} />;
}

function SignedMarks({
  storyId,
  hearted,
  completed,
}: {
  storyId: string;
  hearted: boolean;
  completed: boolean;
}) {
  const t = useTranslations("Stories");
  const { sound, volume } = useSettings();
  const reduceMotion = useReducedMotion();
  const heartOnSound = useClip("ui/success.mp3", 0.55, sound, volume);
  const heartOffSound = useClip("ui/pop-down.mp3", 0.5, sound, volume);
  const doneOnSound = useClip("ui/success.mp3", 0.55, sound, volume);
  const doneOffSound = useClip("ui/pop-down.mp3", 0.5, sound, volume);
  const [heartOn, setHeartOn] = useState(hearted);
  const [done, setDone] = useState(completed);
  const [heartBusy, setHeartBusy] = useState(false);
  const [doneBusy, setDoneBusy] = useState(false);
  const heartLock = useRef(false);
  const doneLock = useRef(false);
  const heartTicket = useRef(0);
  const doneTicket = useRef(0);
  const heartIcon = useRef<HTMLSpanElement>(null);
  const doneIcon = useRef<HTMLSpanElement>(null);

  function settle(ticket: number, tickets: { current: number }, optimistic: boolean, result: MarkResult, set: (value: boolean) => void) {
    if (ticket !== tickets.current) {
      return;
    }
    if (typeof result !== "boolean") {
      set(!optimistic);
      return;
    }
    set(result);
  }

  function commit(
    next: boolean,
    set: (value: boolean) => void,
    setBusy: (value: boolean) => void,
    lock: { current: boolean },
    tickets: { current: number },
    icon: HTMLElement | null,
    sample: { play: () => void; clip: Clip | null; enabled: boolean },
    send: () => Promise<MarkResult>,
  ) {
    if (lock.current) {
      return;
    }
    lock.current = true;
    const ticket = ++tickets.current;
    setBusy(true);
    set(next);
    void (async () => {
      let sent = false;
      try {
        await Promise.all([popIcon(icon, reduceMotion), playThrough(sample.play, sample.clip, sample.enabled)]);
        const request = send();
        sent = true;
        void request
          .then((result) => settle(ticket, tickets, next, result, set))
          .catch(() => settle(ticket, tickets, next, "signed-out", set));
      } finally {
        if (!sent && ticket === tickets.current) {
          set(!next);
        }
        if (ticket === tickets.current) {
          lock.current = false;
          setBusy(false);
        }
      }
    })();
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
        aria-busy={heartBusy}
        disabled={heartBusy}
        className="disabled:opacity-100"
        onClick={() =>
          commit(
            !heartOn,
            setHeartOn,
            setHeartBusy,
            heartLock,
            heartTicket,
            heartIcon.current,
            heartOn ? heartOffSound : heartOnSound,
            () => toggleHeart(storyId),
          )
        }
      >
        <span ref={heartIcon} className="inline-flex">
          <Heart className={heartOn ? "fill-rose-500 text-rose-500" : undefined} />
        </span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        sound={false}
        aria-pressed={done}
        aria-label={done ? t("completed") : t("complete")}
        aria-busy={doneBusy}
        disabled={doneBusy}
        className={done ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white disabled:opacity-100" : "disabled:opacity-100"}
        onClick={() =>
          commit(
            !done,
            setDone,
            setDoneBusy,
            doneLock,
            doneTicket,
            doneIcon.current,
            done ? doneOffSound : doneOnSound,
            () => toggleComplete(storyId),
          )
        }
      >
        <span ref={doneIcon} className="inline-flex">
          <CircleCheck />
        </span>
      </Button>
    </div>
  );
}
