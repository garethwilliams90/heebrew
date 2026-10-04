import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignUpForm } from "@/components/sign-up-form";
import { getLocale } from "next-intl/server";

export default async function SignUpPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const locale = await getLocale();

  if (data?.claims) {
    redirect({ href: "/", locale });
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <SignUpForm className="w-full max-w-sm" />
    </main>
  );
}
