"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export function StudyAmountField({
  labelId,
  title,
  count,
  limit,
  disabled,
  onCount,
  hint,
}: {
  labelId: string;
  title: string;
  count: number;
  limit: number;
  disabled?: boolean;
  onCount: (count: number) => void;
  hint?: ReactNode;
}) {
  const value = Math.min(count, limit);

  return (
    <section className={`mt-8 ${disabled ? "opacity-50" : ""}`}>
      <h2 id={labelId} className="text-lg font-semibold">
        {title}
      </h2>
      <div className="mt-4 flex items-center gap-4">
        <Slider
          min={1}
          max={limit}
          step={1}
          value={[value]}
          disabled={disabled}
          aria-labelledby={labelId}
          onValueChange={(next) => {
            const chosen = next[0];
            if (typeof chosen === "number") {
              onCount(chosen);
            }
          }}
        />
        <Input
          type="number"
          inputMode="numeric"
          min={1}
          max={limit}
          value={value}
          disabled={disabled}
          aria-labelledby={labelId}
          className="h-11 w-20 border-emerald-900/10 bg-white text-center"
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isInteger(next)) {
              onCount(Math.min(limit, Math.max(1, next)));
            }
          }}
        />
      </div>
      {hint}
    </section>
  );
}
