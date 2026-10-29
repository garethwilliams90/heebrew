"use client";

import { useTranslations } from "next-intl";
import { AlephMark } from "@/components/brand/aleph-mark";
import { DevLevelControl } from "@/components/learn/dev-level";
import { LevelPath } from "@/components/home/level-path";
import { KofiSupport } from "@/components/support/kofi-support";
import type { PathwaySectionOutline } from "@/lib/learn/pathway/types";

export function WelcomeHome({ outline }: { outline: readonly PathwaySectionOutline[] }) {
  const t = useTranslations("Home");

  return (
    <main className="flex min-h-0 flex-1 flex-col items-center gap-12 overflow-y-auto py-6">
      <header className="flex flex-col items-center gap-4 px-4 text-center">
        <AlephMark className="size-28 sm:size-36" />
        <h1 className="text-4xl font-semibold tracking-tight text-emerald-950 sm:text-5xl">{t("hebrew")}</h1>
      </header>
      <KofiSupport variant="label" />
      <LevelPath outline={outline} />
      <DevLevelControl />
    </main>
  );
}
