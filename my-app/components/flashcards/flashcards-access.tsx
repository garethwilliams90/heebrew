"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import { loadExperience } from "@/lib/flashcards/experience";
import { flashcardsUnlocked } from "@/lib/learn/flashcards-access";

export function FlashcardsNavLink({
  href,
  className,
  current,
  children,
}: {
  href: "/decks";
  className: string;
  current: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations("Flashcards");
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    function refresh() {
      void loadExperience().then((saved) => setOpen(flashcardsUnlocked(saved.experience)));
    }

    refresh();
    window.addEventListener("webrew-experience", refresh);
    return () => window.removeEventListener("webrew-experience", refresh);
  }, []);

  if (open) {
    return (
      <Link href={href} className={className} aria-current={current ? "page" : undefined}>
        {children}
      </Link>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn(className, "cursor-not-allowed opacity-55")}
        aria-disabled="true"
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{t("unlockedAtLevel")}</TooltipContent>
    </Tooltip>
  );
}

export function FlashcardsAccess({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Flashcards");
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    void loadExperience().then((saved) => setOpen(flashcardsUnlocked(saved.experience)));
  }, []);

  if (open === null) {
    return null;
  }

  if (!open) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-base text-emerald-900">{t("unlockedAtLevel")}</p>
      </main>
    );
  }

  return children;
}
