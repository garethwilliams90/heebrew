"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudyGradeBar({
  flipped,
  dontKnowLabel,
  knowLabel,
  masteredLabel,
  onDontKnow,
  onKnow,
  onMastered,
}: {
  flipped: boolean;
  dontKnowLabel: string;
  knowLabel: string;
  masteredLabel?: string;
  onDontKnow: () => void;
  onKnow: () => void;
  onMastered?: () => void;
}) {
  return (
    <div
      className={`mt-4 transition-opacity duration-200 ${
        flipped ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-14 border-red-200 bg-white text-red-800 hover:bg-red-50"
          aria-keyshortcuts="ArrowLeft"
          disabled={!flipped}
          onClick={onDontKnow}
        >
          {dontKnowLabel}
          <ArrowLeft className="size-5" strokeWidth={3} />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-14 border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50"
          aria-keyshortcuts="ArrowRight"
          disabled={!flipped}
          onClick={onKnow}
        >
          {knowLabel}
          <ArrowRight className="size-5" strokeWidth={3} />
        </Button>
      </div>
      {masteredLabel && onMastered ? (
        <div className="flex justify-center">
          <Button
            type="button"
            className="mt-3 h-12 w-2/3 bg-emerald-800 text-white hover:bg-emerald-900"
            disabled={!flipped}
            onClick={onMastered}
          >
            {masteredLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
