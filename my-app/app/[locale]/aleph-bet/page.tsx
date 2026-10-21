import { AlephBetSession } from "@/components/alephbet/alephbet-session";
import { FeatureAccess } from "@/components/learn/feature-access";

export default function AlephBetPage() {
  return (
    <FeatureAccess feature="aleph">
      <AlephBetSession />
    </FeatureAccess>
  );
}