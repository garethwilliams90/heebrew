"use client";

import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function ReviewPrompt({ title, href, onLater }: { title: string; href: string; onLater: () => void }) {
  const t = useTranslations("Home");
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-emerald-950/30 p-4">
      <div className="flex w-full max-w-md flex-col gap-2 rounded-3xl bg-white p-6 text-center shadow-xl">
        <h2 className="text-2xl font-semibold text-emerald-950">{t("reviewTitle")}</h2>
        <p className="text-emerald-900">{t("reviewBody", { section: title })}</p>
        <div className="mt-3 flex flex-col gap-2">
          <Link href={href} className={buttonVariants()}>
            {t("reviewStart")}
          </Link>
          <Button type="button" variant="outline" onClick={onLater}>
            {t("reviewLater")}
          </Button>
        </div>
      </div>
    </div>
  );
}
