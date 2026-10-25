"use client";

import { useEffect, useRef } from "react";

export function useStudyCardKeyboard({
  enabled = true,
  busy,
  onFlip,
  onLeft,
  onRight,
  onReplay,
}: {
  enabled?: boolean;
  busy: { current: boolean };
  onFlip: () => void;
  onLeft: () => void;
  onRight: () => void;
  onReplay: () => void;
}) {
  const enabledRef = useRef(enabled);
  const flipRef = useRef(onFlip);
  const leftRef = useRef(onLeft);
  const rightRef = useRef(onRight);
  const replayRef = useRef(onReplay);

  enabledRef.current = enabled;
  flipRef.current = onFlip;
  leftRef.current = onLeft;
  rightRef.current = onRight;
  replayRef.current = onReplay;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!enabledRef.current) {
        return;
      }

      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select")) {
        return;
      }

      if (event.repeat || busy.current) {
        return;
      }

      if (event.key === " " || event.code === "Space") {
        if (target instanceof HTMLElement && target.closest("button, a")) {
          return;
        }

        event.preventDefault();
        flipRef.current();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        leftRef.current();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        rightRef.current();
        return;
      }

      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        replayRef.current();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy]);
}
