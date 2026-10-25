"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { NextLevelLink } from "@/components/learn/level-finish";

export function LevelClear({
  level,
  title,
  body,
}: {
  level: number;
  title?: string;
  body?: ReactNode;
}) {
  const t = useTranslations("Learn");

  return (
    <div className="flex max-w-xl flex-col items-center text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">{title ?? t("levelClear", { level })}</h1>
      {body ? <p className="mt-3 text-base text-emerald-900/80 sm:text-lg">{body}</p> : null}
      <NextLevelLink level={level} />
    </div>
  );
}
