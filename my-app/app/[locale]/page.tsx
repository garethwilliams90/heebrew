import { getLocale } from "next-intl/server";
import { WelcomeHome } from "@/components/home/welcome-home";
import { redirect } from "@/i18n/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ deck?: string; view?: string }>;
}) {
  const { deck, view } = await searchParams;
  if (deck) {
    const locale = await getLocale();
    const params = new URLSearchParams({ deck });
    if (view) {
      params.set("view", view);
    }
    redirect({ href: `/decks?${params.toString()}`, locale });
  }

  return <WelcomeHome />;
}
