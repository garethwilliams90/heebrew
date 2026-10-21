"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "lucide-react";
import { FormDialog } from "@/components/flashcards/form-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "cn";

const lastLevel = 14;

export function LevelClose({ finished, className }: { finished: boolean; className?: string }) {
  const t = useTranslations("Learn");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function leave() {
    if (finished) {
      router.push("/");
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <div className={className}>
        <Button
          type="button"
          variant="ghost"
          className="size-11 rounded-full bg-white/90 p-0 shadow-sm"
          aria-label={t("closeLevel")}
          onClick={leave}
        >
          <XIcon className="size-6" />
        </Button>
      </div>
      {open ? (
        <FormDialog label={t("leaveTitle")} onClose={() => setOpen(false)} className="w-full max-w-md">
          <div className="rounded-3xl bg-white p-6 text-center shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)]">
            <h2 className="text-xl font-semibold text-emerald-950">{t("leaveTitle")}</h2>
            <p className="mt-3 text-sm text-emerald-900/80">{t("leaveBody")}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("leaveStay")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setOpen(false);
                  router.push("/");
                }}
              >
                {t("leaveConfirm")}
              </Button>
            </div>
          </div>
        </FormDialog>
      ) : null}
    </>
  );
}

export function NextLevelLink({ level }: { level: number }) {
  const t = useTranslations("Learn");
  if (level >= lastLevel) {
    return (
      <Link href="/" className={cn(buttonVariants(), "mt-6 h-12 px-6")}>
        {t("back")}
      </Link>
    );
  }

  const next = level + 1;
  const href = next === 2 ? "/learn?from=2.0" : `/learn?level=${next}`;

  return (
    <Link href={href} className={cn(buttonVariants(), "mt-6 h-12 px-6")}>
      {t("goToLevel", { level: next })}
    </Link>
  );
}
