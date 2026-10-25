"use client";

import { useCallback, useState } from "react";

export function usePracticeHearts(lives = 5) {
  const startHalves = lives * 2;
  const [halves, setHalves] = useState(startHalves);
  const [failed, setFailed] = useState(false);

  const loseHeart = useCallback((cost: number) => {
    setHalves((current) => {
      const next = Math.max(0, current - cost);
      if (next <= 0) {
        setFailed(true);
      }
      return next;
    });
  }, []);

  const resetHearts = useCallback(() => {
    setHalves(startHalves);
    setFailed(false);
  }, [startHalves]);

  return { halves, failed, loseHeart, resetHearts };
}
