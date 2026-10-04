import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

export async function AuthButton() {
  const t = await getTranslations("Auth");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;

  if (typeof email === "string") {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm">{t("signedInAs", { email })}</p>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline">
        <Link href="/login">{t("logIn")}</Link>
      </Button>
      <Button asChild>
        <Link href="/sign-up">{t("signUp")}</Link>
      </Button>
    </div>
  );
}
