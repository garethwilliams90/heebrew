"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function HearReplayButton({
  children,
  onHear,
  pressed,
}: {
  children: ReactNode;
  onHear: () => void;
  pressed?: boolean;
}) {
  const [down, setDown] = useState(false);
  const active = pressed ?? down;

  return (
    <motion.span
      className="relative inline-flex"
      animate={{ scale: active ? 0.96 : 1 }}
      transition={{ type: "spring", bounce: 0.05, visualDuration: 0.12 }}
    >
      <Button
        type="button"
        variant="outline"
        className="h-10 px-5"
        aria-keyshortcuts="R"
        onPointerDown={() => setDown(true)}
        onPointerUp={() => setDown(false)}
        onPointerLeave={() => setDown(false)}
        sound={false}
        onClick={onHear}
      >
        {children}
      </Button>
      <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-800 text-[10px] font-semibold text-white">
        R
      </span>
    </motion.span>
  );
}
