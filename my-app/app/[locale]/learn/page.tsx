import { LevelRunner, SectionExam } from "@/components/learn/pathway/learn-route";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export default async function Learn({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; level?: string; exam?: string; review?: string }>;
}) {
  const { section, level, exam, review } = await searchParams;
  if (section && (exam === "1" || review === "1")) {
    return <SectionExam sectionId={section} review={review === "1"} />;
  }
  if (section && level) {
    return <LevelRunner key={`${section}-${level}`} sectionId={section} levelId={level} />;
  }

  const locale = await getLocale();
  redirect({ href: "/", locale });
  return null;
}
