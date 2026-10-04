"use client";

import { useTranslations } from "next-intl";

const levels = [0, 1, 2, 3, 4, 5, 6];

export function FamiliaritySelect({
  level,
  onChange,
}: {
  level: number;
  onChange: (level: number) => void;
}) {
  const t = useTranslations("Flashcards");
  const value = Math.min(6, Math.max(0, level));

  return (
    <select
      aria-label={t("familiarity")}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className={`h-8 max-w-40 rounded-full border border-emerald-900/10 px-2.5 text-xs font-medium ${
        value >= 6
          ? "bg-emerald-800 text-white"
          : value > 0
            ? "bg-emerald-100 text-emerald-900"
            : "bg-emerald-950/5 text-emerald-900/70"
      }`}
    >
      {levels.map((item) => (
        <option key={item} value={item} className="bg-white text-emerald-950">
          {item === 0 ? t("statusNew") : item >= 6 ? t("memorised") : t("mastery", { level: item })}
        </option>
      ))}
    </select>
  );
}
