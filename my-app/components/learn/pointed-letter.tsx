"use client";

import { motion } from "motion/react";

const markSpring = { type: "spring" as const, bounce: 0.22, visualDuration: 0.28 };

export function PointedLetter({ letter, mark = "", tail = "" }: { letter: string; mark?: string; tail?: string }) {
  if (!mark && !tail) {
    return letter;
  }

  return (
    <span className="inline-flex items-end">
      <span className="inline-grid">
        <motion.span
          key={`${mark}${tail}`}
          aria-hidden
          className="col-start-1 row-start-1 text-blue-600"
          initial={{ opacity: 0, y: 8, scale: 0.86 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={markSpring}
        >
          {letter}
          {mark}
        </motion.span>
        <span className="relative z-10 col-start-1 row-start-1 text-black">{letter}</span>
      </span>
      {tail ? (
        <motion.span
          key={tail}
          aria-hidden
          className="text-blue-600"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={markSpring}
        >
          {tail}
        </motion.span>
      ) : null}
    </span>
  );
}
