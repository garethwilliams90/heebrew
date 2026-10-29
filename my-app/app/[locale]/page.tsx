import { WelcomeHome } from "@/components/home/welcome-home";
import { pathwayOutline } from "@/lib/learn/pathway/catalog";

export default function Home() {
  return <WelcomeHome outline={pathwayOutline()} />;
}
