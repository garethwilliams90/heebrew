"use client";

import { useState } from "react";

const START_HALVES = 10;

export function usePracticeHearts() {
  const [halves, setHalves] = useState(START_HALVES);
  const [failed, setFailed] = useState(false);

  function loseHeart(cost: number) {
    setHalves((current) => {
      const next = Math.max(0, current - cost);
      if (next <= 0) {
        setFailed(true);
      }
      return next;
    });
  }

  function resetHearts() {
    setHalves(START_HALVES);
    setFailed(false);
  }

  return { halves, failed, loseHeart, resetHearts };
}
