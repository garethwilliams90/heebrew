"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { useCue } from "@/components/settings/use-cue";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";

const navButton = "h-12 min-w-36 px-8 text-lg";
const press = { type: "spring" as const, bounce: 0.05, visualDuration: 0.12 };

export function LevelNav({
  leading,
  backHref,
  onBack,
  backDisabled,
  onNext,
  nextDisabled,
}: {
  leading?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  backDisabled?: boolean;
  onNext?: () => void;
  nextDisabled?: boolean;
}) {
  const t = useTranslations("Learn");
  const router = useRouter();
  const playSwitch = useCue("switchOn");
  const [held, setHeld] = useState<"back" | "next" | null>(null);
  const showBack = Boolean(backHref || onBack);
  const backHrefRef = useRef(backHref);
  const onBackRef = useRef(onBack);
  const onNextRef = useRef(onNext);
  const backDisabledRef = useRef(backDisabled);
  const nextDisabledRef = useRef(nextDisabled);
  const playRef = useRef(playSwitch);
  const routerRef = useRef(router);

  backHrefRef.current = backHref;
  onBackRef.current = onBack;
  onNextRef.current = onNext;
  backDisabledRef.current = backDisabled;
  nextDisabledRef.current = nextDisabled;
  playRef.current = playSwitch;
  routerRef.current = router;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea")) {
        return;
      }

      const backward = event.key === "ArrowLeft" && (backHrefRef.current || onBackRef.current);
      const forward = event.key === "ArrowRight" && onNextRef.current;
      if (!backward && !forward) {
        return;
      }

      event.preventDefault();
      const which = backward ? "back" : "next";
      if (event.type === "keydown") {
        if (event.repeat) {
          return;
        }
        setHeld(which);
        return;
      }

      setHeld(null);
      if (which === "back" && backDisabledRef.current) {
        return;
      }
      if (which === "next" && nextDisabledRef.current) {
        return;
      }

      playRef.current();
      if (which === "back") {
        if (backHrefRef.current) {
          routerRef.current.push(backHrefRef.current);
          return;
        }
        onBackRef.current?.();
        return;
      }
      onNextRef.current?.();
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  if (!showBack && !onNext && !leading) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center justify-center gap-4 py-3">
      {leading}
      {showBack ? (
        <motion.span animate={{ scale: held === "back" ? 0.96 : 1 }} transition={press}>
          {backHref ? (
            <Button asChild variant="outline" className={navButton}>
              <Link href={backHref} aria-keyshortcuts="ArrowLeft">
                <ArrowLeftIcon className="size-6" /> {t("back")}
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className={navButton}
              disabled={backDisabled}
              aria-keyshortcuts="ArrowLeft"
              onClick={onBack}
            >
              <ArrowLeftIcon className="size-6" /> {t("back")}
            </Button>
          )}
        </motion.span>
      ) : null}
      {onNext ? (
        <motion.span animate={{ scale: held === "next" ? 0.96 : 1 }} transition={press}>
          <Button
            type="button"
            className={`${navButton} bg-emerald-800 text-white hover:bg-emerald-900`}
            disabled={nextDisabled}
            aria-keyshortcuts="ArrowRight"
            onClick={onNext}
          >
            {t("next")} <ArrowRightIcon className="size-6" />
          </Button>
        </motion.span>
      ) : null}
    </div>
  );
}
