"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function AccountNotice({
  signedOut,
  saveError,
}: {
  signedOut: boolean;
  saveError: boolean;
}) {
  const t = useTranslations("Flashcards");

  return (
    <>
      {signedOut ? (
        <p className="mb-4 text-center text-sm text-emerald-900/70">
          <Link href="/login" className="text-emerald-800 underline underline-offset-2">
            {t("signInToSave")}
          </Link>
        </p>
      ) : null}
      {saveError ? (
        <p className="mb-4 text-center text-sm text-red-800" role="alert">
          {t("saveError")}
        </p>
      ) : null}
    </>
  );
}
