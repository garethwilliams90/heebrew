"use client";

import { useEffect, useRef, useState } from "react";

export function useReplayPulse<Target extends string = string>() {
  const [replayOn, setReplayOn] = useState(false);
  const [replayTick, setReplayTick] = useState(0);
  const [replayTarget, setReplayTarget] = useState<Target | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  function pulse(target?: Target) {
    if (target !== undefined) {
      setReplayTarget(target);
    }

    setReplayTick((tick) => tick + 1);
    setReplayOn(true);
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => setReplayOn(false), 450);
  }

  return { replayOn, replayTick, replayTarget, pulse };
}
