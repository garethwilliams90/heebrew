import { AlphabetIntro } from "@/components/learn/alphabet-intro";
import { LetterPairLevel } from "@/components/learn/letter-pair-level";
import { ReadingLevel } from "@/components/learn/reading-level";
import { stepForStage } from "@/lib/learn/stages";

export default async function Learn({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; level?: string }>;
}) {
  const { from, level } = await searchParams;
  const major = Number(level);
  if (Number.isFinite(major) && major >= 12) {
    return <ReadingLevel level={Math.floor(major)} />;
  }
  if (Number.isFinite(major) && major >= 3) {
    return <LetterPairLevel level={Math.floor(major)} />;
  }

  return <AlphabetIntro initialStep={stepForStage(from)} />;
}
