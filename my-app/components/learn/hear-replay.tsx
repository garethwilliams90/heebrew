"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function HearReplayButton({
  children,
  onHear,
  pressed,
  disabled = false,
}: {
  children: ReactNode;
  onHear: () => void;
  pressed?: boolean;
  disabled?: boolean;
}) {
  const [down, setDown] = useState(false);
  const hearRef = useRef(onHear);
  const disabledRef = useRef(disabled);
  hearRef.current = onHear;
  disabledRef.current = disabled;
  const active = down || pressed;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (disabledRef.current || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }
      if (event.key !== "r" && event.key !== "R") {
        return;
      }
      event.preventDefault();
      if (event.type === "keyup") {
        setDown(false);
        return;
      }
      if (event.repeat) {
        return;
      }
      setDown(true);
      hearRef.current();
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

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
        disabled={disabled}
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
