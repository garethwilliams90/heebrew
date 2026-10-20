import { HomeDashboard } from "@/components/home/home-dashboard";
import { WelcomeCard } from "@/components/home/welcome-card";
import { loadHomeStats } from "@/lib/flashcards/home-stats";

export default async function Profile() {
  const stats = await loadHomeStats();

  return (
    <HomeDashboard stats={stats}>
      <WelcomeCard />
    </HomeDashboard>
  );
}
