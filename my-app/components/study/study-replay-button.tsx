"use client";

import { Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function StudyReplayButton({
  label,
  disabled,
  pulsing,
  pulseKey,
  showPulse = pulsing,
  showShortcut = false,
  size = "icon-lg",
  className,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  pulsing?: boolean;
  pulseKey?: string | number;
  showPulse?: boolean;
  showShortcut?: boolean;
  size?: "icon" | "icon-lg";
  className?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <span className={className ?? "relative"}>
      <Button
        type="button"
        variant="outline"
        size={size}
        className={`border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50 ${
          pulsing ? "ring-2 ring-emerald-500" : ""
        }`}
        aria-keyshortcuts={showShortcut ? "R" : undefined}
        aria-label={label}
        disabled={disabled}
        sound={false}
        onClick={onClick}
      >
        <Volume2 />
      </Button>
      {showShortcut ? (
        <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-emerald-800 text-[9px] font-semibold text-white">
          R
        </span>
      ) : null}
      {showPulse ? (
        <motion.span
          key={pulseKey}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-600"
          initial={{ opacity: 0.75, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ willChange: "transform, opacity" }}
        />
      ) : null}
    </span>
  );
}
