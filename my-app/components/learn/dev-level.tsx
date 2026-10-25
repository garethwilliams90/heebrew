"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { levelById, sectionById } from "@/lib/learn/pathway/catalog";
import { completeLevel, devSetPlace, devSkipAll, openSectionIndex, PATHWAY_EVENT } from "@/lib/learn/pathway/progress";
import { isLocalHost } from "@/lib/learn/local-host";

export function useLocalhost() {
  const [local, setLocal] = useState(false);

  useEffect(() => {
    setLocal(isLocalHost());
  }, []);

  return local;
}

export function DevLevelControl() {
  const t = useTranslations("Learn");
  const router = useRouter();
  const local = useLocalhost();
  const [section, setSection] = useState("1");
  const [level, setLevel] = useState("0");
  const [current, setCurrent] = useState<number | null>(null);
  const [here, setHere] = useState<{ section: string; level: string } | null>(null);

  useEffect(() => {
    function refresh() {
      setCurrent(openSectionIndex());
      const params = new URLSearchParams(window.location.search);
      setHere({ section: params.get("section") ?? "", level: params.get("level") ?? "" });
    }
    refresh();
    window.addEventListener(PATHWAY_EVENT, refresh);
    window.addEventListener("popstate", refresh);
    return () => {
      window.removeEventListener(PATHWAY_EVENT, refresh);
      window.removeEventListener("popstate", refresh);
    };
  }, []);

  if (!local) {
    return null;
  }

  function openPlace(event: FormEvent) {
    event.preventDefault();
    const nextSection = Number(section);
    const nextLevel = Number(level);
    if (!Number.isFinite(nextSection) || nextSection < 1 || !Number.isFinite(nextLevel) || nextLevel < 0) {
      return;
    }
    const place = devSetPlace(nextSection, nextLevel);
    router.push(`/learn?section=${place.sectionId}&level=${place.levelId}`);
  }

  function skipAll() {
    devSkipAll();
    router.push("/");
  }

  function skipLevel() {
    if (!here?.level || !here.section) {
      return;
    }
    completeLevel(here.level);
    const active = sectionById(here.section);
    const currentLevel = levelById(here.level);
    const next = active?.levels.find((item) => currentLevel && item.index === currentLevel.index + 1);
    if (next) {
      router.push(`/learn?section=${here.section}&level=${next.id}`);
      return;
    }
    router.push(`/learn?section=${here.section}&exam=1`);
  }

  return (
    <form
      className="fixed bottom-20 left-4 z-30 flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-2 rounded-2xl border border-emerald-950/10 bg-white/95 px-3 py-2 text-sm text-emerald-950 shadow-lg"
      onSubmit={openPlace}
    >
      <span className="font-medium">{t("devSection", { section: current ?? "…" })}</span>
      <label className="sr-only" htmlFor="dev-section">
        {t("devSection", { section: current ?? "…" })}
      </label>
      <input
        id="dev-section"
        type="number"
        min={1}
        max={5}
        value={section}
        onChange={(event) => setSection(event.target.value)}
        className="w-16 rounded-lg border border-emerald-950/15 px-2 py-1"
      />
      <label htmlFor="dev-level">{t("devLevelNumber")}</label>
      <input
        id="dev-level"
        type="number"
        min={0}
        value={level}
        onChange={(event) => setLevel(event.target.value)}
        className="w-16 rounded-lg border border-emerald-950/15 px-2 py-1"
      />
      <button type="submit" className="rounded-full bg-emerald-800 px-3 py-1 font-medium text-white">
        {t("devSet")}
      </button>
      {here?.level ? (
        <button type="button" className="rounded-full border border-emerald-800 px-3 py-1 font-medium" onClick={skipLevel}>
          {t("devSkipLevel")}
        </button>
      ) : null}
      <button type="button" className="rounded-full border border-emerald-800 px-3 py-1 font-medium" onClick={skipAll}>
        {t("devSkipAll")}
      </button>
    </form>
  );
}
