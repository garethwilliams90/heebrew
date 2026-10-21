"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { curriculumLevel, setCurriculumLevel } from "@/lib/learn/curriculum";

export function useLocalhost() {
  const [local, setLocal] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    setLocal(host === "localhost" || host === "127.0.0.1");
  }, []);

  return local;
}

export function DevLevelControl() {
  const t = useTranslations("Learn");
  const local = useLocalhost();
  const [level, setLevel] = useState("1");
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    setCurrent(curriculumLevel());
    function refresh() {
      setCurrent(curriculumLevel());
    }
    window.addEventListener("webrew-curriculum", refresh);
    return () => window.removeEventListener("webrew-curriculum", refresh);
  }, []);

  if (!local) {
    return null;
  }

  return (
    <form
      className="fixed top-20 left-4 z-30 flex items-center gap-2 rounded-2xl border border-emerald-950/10 bg-white/95 px-3 py-2 text-sm text-emerald-950 shadow-lg"
      onSubmit={(event) => {
        event.preventDefault();
        const next = Number(level);
        if (!Number.isFinite(next) || next < 1) {
          return;
        }
        setCurriculumLevel(next);
        setCurrent(Math.floor(next));
      }}
    >
      <label className="font-medium" htmlFor="dev-level">
        {t("devLevel", { level: current ?? "…" })}
      </label>
      <input
        id="dev-level"
        type="number"
        min={1}
        max={22}
        value={level}
        onChange={(event) => setLevel(event.target.value)}
        className="w-16 rounded-lg border border-emerald-950/15 px-2 py-1"
      />
      <button type="submit" className="rounded-full bg-emerald-800 px-3 py-1 font-medium text-white">
        {t("devSet")}
      </button>
    </form>
  );
}
