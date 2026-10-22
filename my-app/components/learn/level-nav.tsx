"use client";

import type { ReactNode } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const navButton = "h-12 min-w-36 px-8 text-lg";

export function LevelNav({
  leading,
  backHref,
  onBack,
  backDisabled,
  backHeld,
  onNext,
  nextDisabled,
}: {
  leading?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  backDisabled?: boolean;
  backHeld?: boolean;
  onNext?: () => void;
  nextDisabled?: boolean;
}) {
  const t = useTranslations("Learn");
  const showBack = Boolean(backHref || onBack);
  if (!showBack && !onNext && !leading) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center justify-center gap-4 py-3">
      {leading}
      {showBack ? (
        <motion.span animate={{ scale: backHeld ? 0.96 : 1 }} transition={{ type: "spring", bounce: 0.05, visualDuration: 0.12 }}>
          {backHref ? (
            <Button asChild variant="outline" className={navButton}>
              <Link href={backHref}>
                <ArrowLeftIcon className="size-6" /> {t("back")}
              </Link>
            </Button>
          ) : (
            <Button type="button" variant="outline" className={navButton} disabled={backDisabled} onClick={onBack}>
              <ArrowLeftIcon className="size-6" /> {t("back")}
            </Button>
          )}
        </motion.span>
      ) : null}
      {onNext ? (
        <Button
          type="button"
          className={`${navButton} bg-emerald-800 text-white hover:bg-emerald-900`}
          disabled={nextDisabled}
          onClick={onNext}
        >
          {t("next")}
        </Button>
      ) : null}
    </div>
  );
}
