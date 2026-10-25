import { AlphabetIntro } from "@/components/learn/alphabet-intro";
import { CurriculumLevel } from "@/components/learn/curriculum-level";
import { LetterPairLevel } from "@/components/learn/letter-pair-level";
import { ReadingLevel } from "@/components/learn/reading-level";
import { SentenceLevel } from "@/components/learn/sentence-level";
import { stepForStage } from "@/lib/learn/stages";

export default async function Learn({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; level?: string }>;
}) {
  const { from, level } = await searchParams;
  const major = Number(level);
  if (major === 13 || major === 14 || major === 15 || major === 16) {
    return <SentenceLevel key={major} level={major} from={from} />;
  }
  if (Number.isFinite(major) && major >= 17 && major <= 40) {
    return <CurriculumLevel key={major} level={major} from={from} />;
  }
  if (Number.isFinite(major) && major >= 12) {
    return <ReadingLevel key={major} level={Math.floor(major)} />;
  }
  if (Number.isFinite(major) && major >= 3) {
    return <LetterPairLevel key={major} level={Math.floor(major)} />;
  }

  return <AlphabetIntro key={from ?? "start"} initialStep={stepForStage(from)} />;
}
