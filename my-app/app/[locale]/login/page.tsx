import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";
import { getLocale } from "next-intl/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const locale = await getLocale();

  if (data?.claims) {
    redirect({ href: "/", locale });
  }

  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <LoginForm className="w-full max-w-sm" initialError={error} />
    </main>
  );
}
