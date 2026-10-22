"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LevelFrame } from "@/components/learn/level-frame";
import { curriculumLevel } from "@/lib/learn/curriculum";
import { isLocalHost } from "@/lib/learn/local-host";

export function useCurriculumGate(level: number) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    setAllowed(isLocalHost() || curriculumLevel() >= level);
  }, [level]);

  return allowed;
}

export function LockedLevel({ level }: { level: number }) {
  const t = useTranslations("Learn");

  return (
    <LevelFrame label={t("level", { id: String(level) })} finished>
      <p className="text-center text-base text-emerald-900">{t("levelLocked")}</p>
    </LevelFrame>
  );
}
