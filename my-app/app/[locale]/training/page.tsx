import { FeatureAccess } from "@/components/learn/feature-access";
import { TrainingSession } from "@/components/training/training-session";

export default function TrainingPage() {
  return (
    <FeatureAccess feature="training">
      <TrainingSession />
    </FeatureAccess>
  );
}
