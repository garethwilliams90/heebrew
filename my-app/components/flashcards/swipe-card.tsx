"use client";

import { motion, usePresenceData } from "motion/react";
import { forwardRef } from "react";

export type SwipeDirection = -1 | 0 | 1;

export const swipeSpring = { type: "spring" as const, bounce: 0.15, visualDuration: 0.32 };
export const flipSpring = { type: "spring" as const, bounce: 0.08, visualDuration: 0.26 };

export const SwipeCard = forwardRef(function SwipeCard(
  {
    flipped,
    onFlip,
    children,
  }: {
    flipped: boolean;
    onFlip: () => void;
    children: React.ReactNode;
  },
  ref: React.Ref<HTMLDivElement>,
) {
  const direction = (usePresenceData() ?? 1) as SwipeDirection;
  const tint = direction < 0 ? "#dc2626" : "#16a34a";

  return (
    <motion.div
      ref={ref}
      className="absolute inset-0"
      style={{ willChange: "transform" }}
      initial={{ opacity: 0, x: direction === 0 ? 0 : direction * -48 }}
      animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
      exit={{
        x: direction * 640,
        y: direction === 0 ? -56 : 0,
        rotate: direction * 6,
        opacity: direction === 0 ? 0 : 1,
        scale: direction === 0 ? 0.96 : 1,
      }}
      transition={swipeSpring}
    >
      <div className="perspective-distant h-full">
        <motion.div
          className="relative h-full w-full cursor-pointer transform-3d"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={flipSpring}
          style={{ transformStyle: "preserve-3d" }}
          onClick={onFlip}
        >
          {children}
        </motion.div>
      </div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[2rem]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: direction === 0 ? 0 : 0.38 }}
        style={{ backgroundColor: tint }}
      />
    </motion.div>
  );
});

export function CardFace({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-emerald-950/10 bg-white/90 px-10 text-center shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)] backface-hidden ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
