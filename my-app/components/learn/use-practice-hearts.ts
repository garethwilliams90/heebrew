"use client";

import { useState } from "react";

export function usePracticeHearts(lives = 5) {
  const startHalves = lives * 2;
  const [halves, setHalves] = useState(startHalves);
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
    setHalves(startHalves);
    setFailed(false);
  }

  return { halves, failed, loseHeart, resetHearts };
}
