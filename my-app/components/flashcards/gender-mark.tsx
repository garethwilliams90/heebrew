"use client";

import { Mars, Venus } from "lucide-react";
import { animate, motion } from "motion/react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import type { GrammaticalGender } from "@/lib/flashcards/types";

const rise = { type: "spring" as const, bounce: 0.18, visualDuration: 0.42 };
const fall = { type: "spring" as const, bounce: 0.12, visualDuration: 0.32 };

export function GenderMark({
  gender,
  number = "singular",
  labeled = true,
}: {
  gender: GrammaticalGender;
  number?: "singular" | "plural";
  labeled?: boolean;
}) {
  const t = useTranslations("Flashcards");
  const activeIcon = useRef<HTMLSpanElement>(null);
  const turns = useRef(0);
  const playing = useRef(false);

  async function liftAndSpin() {
    const icon = activeIcon.current;
    if (!icon || playing.current) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    playing.current = true;
    turns.current += 1;
    icon.style.willChange = "transform";
    try {
      await animate(icon, { y: -14, rotate: turns.current * 360 }, rise);
      await animate(icon, { y: 0 }, fall);
    } finally {
      icon.style.willChange = "auto";
      playing.current = false;
    }
  }

  const male = gender === "masculine";
  const activeColor = male ? "text-blue-600" : "text-pink-500";
  const ActiveIcon = male ? Mars : Venus;

  return (
    <motion.span className="inline-flex items-center gap-2" onHoverStart={() => void liftAndSpin()}>
      <span className="inline-flex items-center gap-1">
        <IconSlot active color={activeColor} iconRef={activeIcon}>
          <ActiveIcon aria-hidden />
        </IconSlot>
        {number === "plural" ? (
          <>
            <IconSlot active color={activeColor}>
              <ActiveIcon aria-hidden />
            </IconSlot>
            <span className={cn("text-base font-semibold leading-none", activeColor)} aria-hidden>
              +
            </span>
          </>
        ) : null}
      </span>
      {labeled ? (
        <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">{t(gender)}</span>
      ) : null}
    </motion.span>
  );
}

function IconSlot({
  active,
  color,
  iconRef,
  children,
}: {
  active: boolean;
  color: string;
  iconRef?: React.Ref<HTMLSpanElement>;
  children: React.ReactNode;
}) {
  return (
    <span
      ref={iconRef}
      className={cn("inline-flex [&_svg]:size-5", color, active ? "opacity-100" : "opacity-30")}
    >
      {children}
    </span>
  );
}
