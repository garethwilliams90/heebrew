"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import { curriculumLevel } from "@/lib/learn/curriculum";

export type LockedFeature = "study" | "aleph" | "training";

const featureLevel: Record<LockedFeature, number> = {
  study: 3,
  aleph: 3,
  training: 10,
};

export function useFeatureOpen(level: number) {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    function refresh() {
      setOpen(curriculumLevel() >= level);
    }

    refresh();
    window.addEventListener("webrew-curriculum", refresh);
    return () => window.removeEventListener("webrew-curriculum", refresh);
  }, [level]);

  return open;
}

function useFeatureMessage(feature: LockedFeature) {
  const flashcards = useTranslations("Flashcards");
  const aleph = useTranslations("AlephBet");
  const training = useTranslations("Training");
  if (feature === "training") {
    return training("unlockedAtLevel");
  }
  if (feature === "aleph") {
    return aleph("unlockedAtLevel");
  }
  return flashcards("unlockedAtLevel");
}

export function FeatureAccess({ feature, children }: { feature: LockedFeature; children: ReactNode }) {
  const open = useFeatureOpen(featureLevel[feature]);
  const message = useFeatureMessage(feature);

  if (open === null) {
    return null;
  }

  if (!open) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-base text-emerald-900">{message}</p>
      </main>
    );
  }

  return children;
}

export function LockedNavLink({
  href,
  className,
  current,
  feature,
  children,
}: {
  href: "/decks" | "/training" | "/aleph-bet";
  className: string;
  current: boolean;
  feature: LockedFeature;
  children: ReactNode;
}) {
  const open = useFeatureOpen(featureLevel[feature]);
  const message = useFeatureMessage(feature);

  if (open) {
    return (
      <Link href={href} className={className} aria-current={current ? "page" : undefined}>
        {children}
      </Link>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger type="button" className={cn(className, "cursor-not-allowed opacity-55")} aria-disabled="true">
        {children}
      </TooltipTrigger>
      <TooltipContent>{message}</TooltipContent>
    </Tooltip>
  );
}
