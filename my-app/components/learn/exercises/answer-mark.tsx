"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "cn";

export type AnswerTone = "correct" | "wrong" | null;

export function answerTone(tone: AnswerTone) {
  if (tone === "correct") {
    return "border-green-600! bg-green-200! text-green-950! ring ring-green-600";
  }
  if (tone === "wrong") {
    return "border-red-600! bg-red-200! text-red-800! ring ring-red-600 disabled:opacity-100";
  }
  return "";
}

export function AnswerPop({ tone, children, className }: { tone: AnswerTone; children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn(className)}
      animate={tone === "correct" ? { scale: [1, 1.08, 1] } : tone === "wrong" ? { x: [0, -7, 7, -3, 0] } : { scale: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
