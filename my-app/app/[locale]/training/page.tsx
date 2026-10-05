import { getTranslations } from "next-intl/server";
import { SiteFrame } from "@/components/site-frame";
import { TrainingSession } from "@/components/training/training-session";

export default async function TrainingPage() {
  const t = await getTranslations("Flashcards");
  const training = await getTranslations("Training");

  return (
    <SiteFrame
      brand={t("brand")}
      links={[
        { href: "/", label: t("decks") },
        { label: training("nav"), current: true },
      ]}
    >
      <TrainingSession />
    </SiteFrame>
  );
}
