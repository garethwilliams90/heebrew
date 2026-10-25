"use client";

import { Heart, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function HeartRow({ hearts, max = 5 }: { hearts: number; max?: number }) {
  const t = useTranslations("Learn");

  return (
    <div className="flex items-center gap-1" aria-label={t("hearts", { count: hearts })}>
      {Array.from({ length: max }, (_, index) => {
        const fill = Math.min(1, Math.max(0, hearts - index));
        return <HeartPip key={index} fill={fill} />;
      })}
    </div>
  );
}

function HeartPip({ fill }: { fill: number }) {
  return (
    <span className="relative inline-flex size-5" aria-hidden>
      <Heart className="size-5 text-emerald-950/15" />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
        <Heart className="size-5 fill-rose-500 text-rose-500" />
      </span>
    </span>
  );
}

export function HintButton({
  disabled,
  onHint,
}: {
  disabled: boolean;
  onHint: () => void;
}) {
  const t = useTranslations("Learn");

  return (
    <Button type="button" variant="outline" className="h-9 gap-1.5 px-3" disabled={disabled} onClick={onHint}>
      <Lightbulb className="size-4" />
      {t("hint")}
    </Button>
  );
}
