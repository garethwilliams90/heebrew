"use client";

import { useEffect, useRef } from "react";
import { useCue } from "@/components/settings/use-cue";
import { addExperience } from "@/lib/flashcards/experience";
import { LESSON_EXPERIENCE } from "@/lib/learn/lesson-experience";

export function useAdvance(onPass: () => void, onMiss?: () => void) {
  const success = useCue("success");
  const wrong = useCue("wrong");
  const passRef = useRef(onPass);
  const missRef = useRef(onMiss);
  const timer = useRef<number | null>(null);
  const pending = useRef(false);
  passRef.current = onPass;
  missRef.current = onMiss;

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  return {
    pass() {
      if (pending.current) {
        return;
      }
      pending.current = true;
      success();
      void addExperience(LESSON_EXPERIENCE);
      timer.current = window.setTimeout(() => {
        pending.current = false;
        passRef.current();
      }, 650);
    },
    miss(after?: () => void) {
      wrong();
      missRef.current?.();
      if (!after) {
        return;
      }
      window.setTimeout(after, 480);
    },
  };
}
