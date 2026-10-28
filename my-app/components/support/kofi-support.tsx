"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Coffee, X } from "lucide-react";
import { FormDialog } from "@/components/flashcards/form-dialog";
import { Button } from "@/components/ui/button";
import { kofiEmbedUrl, socialLinks } from "@/lib/site/social";

type Supporter = {
  id: string;
  name: string | null;
  message: string | null;
  amount: number;
  currency: string;
};

const cupButton =
  "bg-[#ff5e5b] text-white shadow-[0_16px_30px_-12px_rgba(180,40,40,0.85)] hover:bg-[#e94e4b]";

export function KofiSupport({ variant = "icon" }: { variant?: "icon" | "label" }) {
  const t = useTranslations("Support");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size={variant === "icon" ? "icon" : "default"}
        className={variant === "icon" ? `size-12 ${cupButton}` : `h-11 gap-2 px-4 ${cupButton}`}
        aria-label={t("open")}
        onClick={() => setOpen(true)}
      >
        <Coffee className={variant === "icon" ? "size-6" : "size-5"} />
        {variant === "label" ? t("label") : null}
      </Button>
      {open ? <KofiDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function KofiHomeButton() {
  const pathname = usePathname();
  if (pathname !== "/") {
    return null;
  }

  return (
    <div className="fixed bottom-3 left-3 z-40 md:bottom-4 md:left-4">
      <KofiSupport />
    </div>
  );
}

function KofiDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Support");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [supporters, setSupporters] = useState<Supporter[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/kofi/supporters", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { supporters: [] }))
      .then((body: { supporters?: Supporter[] }) => {
        setSupporters(Array.isArray(body.supporters) ? body.supporters : []);
      })
      .catch(() => {
        setSupporters([]);
      });

    return () => controller.abort();
  }, []);

  return (
    <FormDialog label={t("title")} onClose={onClose} className="w-full max-w-md">
      <motion.div
        className="rounded-3xl bg-white p-5 text-emerald-950 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)]"
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.2, visualDuration: 0.28 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{t("title")}</h2>
            <p className="mt-1 text-sm text-emerald-900/80">{t("body")}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0" aria-label={t("close")} autoFocus onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>
        {supporters.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            <li className="text-xs font-medium tracking-wide text-emerald-800/70 uppercase">{t("supporters")}</li>
            {supporters.map((supporter) => (
              <li key={supporter.id} className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm">
                <span className="font-medium">{supporter.name || t("someone")}</span>
                <span className="text-emerald-900/70"> · {money(supporter.amount, supporter.currency, locale)}</span>
                {supporter.message ? <p className="mt-1 text-emerald-900/80">{supporter.message}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
        <iframe
          title={t("title")}
          src={kofiEmbedUrl}
          className="mt-4 h-[32rem] w-full rounded-2xl border border-emerald-950/10 bg-[#f9f9f9]"
        />
        <a
          href={socialLinks.kofi}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex text-sm font-medium text-[#ff5e5b] underline-offset-4 hover:underline"
        >
          {t("page")}
        </a>
      </motion.div>
    </FormDialog>
  );
}

function money(amount: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}
