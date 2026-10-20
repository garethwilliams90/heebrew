import { AlphabetIntro } from "@/components/learn/alphabet-intro";
import { stepForStage } from "@/lib/learn/stages";

export default async function Learn({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return <AlphabetIntro initialStep={stepForStage(from)} />;
}
