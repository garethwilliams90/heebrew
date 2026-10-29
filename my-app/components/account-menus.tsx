import { Suspense } from "react";
import { SettingsMenu, MobileMenu } from "@/components/settings/app-menus";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";

export function AccountMenus() {
  return (
    <Suspense fallback={<AccountMenusFallback />}>
      <SignedInMenus />
    </Suspense>
  );
}

async function SignedInMenus() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  return (
    <>
      <SettingsMenu email={email} />
      <MobileMenu email={email} />
    </>
  );
}

function AccountMenusFallback() {
  return (
    <>
      <Skeleton className="fixed top-3 right-3 z-40 hidden size-11 rounded-full md:block" />
      <Skeleton className="fixed top-3 left-3 z-40 size-11 rounded-full md:hidden" />
    </>
  );
}
