"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { loadExperience, placeExperience } from "@/lib/flashcards/experience";

export function ExperienceTube() {
  const label = useTranslations("Flashcards");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const refresh = () => {
      void loadExperience().then((saved) => setTotal(saved.experience));
    };
    refresh();
    window.addEventListener("webrew-experience", refresh);
    return () => window.removeEventListener("webrew-experience", refresh);
  }, []);

  const place = placeExperience(total);
  const ratio = place.span === 0 ? 0 : (place.into / place.span) * 100;

  return (
    <div className="flex w-12 shrink-0 flex-col items-center self-stretch py-1">
      <p className="mb-2 text-center text-[10px] font-semibold tracking-wide text-emerald-900">{label("levelLabel", { level: place.level })}</p>
      <div className="relative min-h-0 w-5 flex-1 overflow-hidden rounded-full bg-emerald-950/10">
        <motion.div
          className="absolute inset-x-0 bottom-0 h-full origin-bottom rounded-full bg-emerald-600"
          initial={false}
          animate={{ scaleY: ratio / 100 }}
          transition={{ type: "spring", bounce: 0.08, visualDuration: 0.5 }}
        />
      </div>
      <p className="mt-2 max-w-14 text-center text-[10px] text-emerald-900/70">{label("experienceProgress", { into: place.into, span: place.span })}</p>
    </div>
  );
}
