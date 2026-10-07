"use client";

import { useTranslations } from "next-intl";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { placeExperience } from "@/lib/flashcards/experience";

const cardClassName =
  "border border-emerald-950/10 bg-white/90 text-emerald-950 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)] ring-0";

export function LevelCard({ experience }: { experience: number }) {
  const t = useTranslations("Home");
  const place = placeExperience(experience);
  const remaining = Math.max(0, place.span - place.into);
  const ratio = place.span === 0 ? 0 : (place.into / place.span) * 100;

  return (
    <Card className={cardClassName}>
      <CardHeader>
        <CardTitle className="text-3xl font-semibold tracking-tight text-emerald-950">
          <h1>{t("levelLabel", { level: place.level })}</h1>
        </CardTitle>
        <CardDescription className="text-emerald-800">
          {t("toNext", { remaining, next: place.level + 1 })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProgressMeter
          label={t("levelLabel", { level: place.level })}
          value={place.into}
          max={place.span}
          ratio={ratio}
          className="h-3 overflow-hidden rounded-full bg-emerald-950/10"
        />
        <p className="mt-3 text-sm text-emerald-900/70">
          {t("experienceProgress", { into: place.into, span: place.span })}
        </p>
      </CardContent>
    </Card>
  );
}
