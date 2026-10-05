"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function CardPager({
  page,
  pageCount,
  start,
  end,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  start: number;
  end: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const t = useTranslations("Flashcards");

  if (total === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <p className="text-sm text-emerald-900/70">{t("cardRange", { start, end, total })}</p>
      {pageCount > 1 ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 border-emerald-900/10 bg-white text-emerald-950 hover:bg-emerald-50"
            disabled={page === 0}
            onClick={() => onPage(page - 1)}
          >
            {t("previous")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 border-emerald-900/10 bg-white text-emerald-950 hover:bg-emerald-50"
            disabled={page >= pageCount - 1}
            onClick={() => onPage(page + 1)}
          >
            {t("next")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
