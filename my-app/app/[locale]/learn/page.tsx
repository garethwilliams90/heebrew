import dynamic from "next/dynamic";
import { stepForStage } from "@/lib/learn/stages";

const AlphabetIntro = dynamic(() =>
  import("@/components/learn/alphabet-intro").then((mod) => mod.AlphabetIntro),
);
const LetterPairLevel = dynamic(() =>
  import("@/components/learn/letter-pair-level").then((mod) => mod.LetterPairLevel),
);
const ReadingLevel = dynamic(() =>
  import("@/components/learn/reading-level").then((mod) => mod.ReadingLevel),
);
const SentenceLevel = dynamic(() =>
  import("@/components/learn/sentence-level").then((mod) => mod.SentenceLevel),
);

export default async function Learn({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; level?: string }>;
}) {
  const { from, level } = await searchParams;
  const major = Number(level);
  if (major === 13 || major === 14) {
    return <SentenceLevel key={major} level={major} from={from} />;
  }
  if (Number.isFinite(major) && major >= 12) {
    return <ReadingLevel key={major} level={Math.floor(major)} />;
  }
  if (Number.isFinite(major) && major >= 3) {
    return <LetterPairLevel key={major} level={Math.floor(major)} />;
  }

  return <AlphabetIntro key={from ?? "start"} initialStep={stepForStage(from)} />;
}
