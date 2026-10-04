import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function SignUpSuccessPage() {
  const t = await getTranslations("Auth");

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-3 text-center">
        <h1 className="text-2xl font-semibold">{t("checkEmailTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("checkEmailDescription")}
        </p>
        <Link href="/login" className="text-sm underline underline-offset-4">
          {t("login")}
        </Link>
      </div>
    </main>
  );
}
