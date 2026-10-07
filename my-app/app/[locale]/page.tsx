import { getLocale } from "next-intl/server";
import { HomeDashboard } from "@/components/home/home-dashboard";
import { WelcomeCard } from "@/components/home/welcome-card";
import { redirect } from "@/i18n/navigation";
import { loadHomeStats } from "@/lib/flashcards/home-stats";

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

  const stats = await loadHomeStats();

  return (
    <HomeDashboard stats={stats}>
      <WelcomeCard />
    </HomeDashboard>
  );
}
