"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { LevelCard } from "./level-card";
import { readLocalPractice } from "@/lib/flashcards/daily-practice";
import { loadExperience } from "@/lib/flashcards/experience";
import { AlephBetCard } from "./aleph-bet-card";
import { Skeleton } from "@/components/ui/skeleton";

const PracticeChart = dynamic(() => import("./practice-chart").then((mod) => mod.PracticeChart), {
  loading: () => <Skeleton className="h-72 w-full rounded-3xl" />,
});

type HomeView = {
  signedIn: boolean;
  experience: number;
  days: { date: string; cards: number }[];
};

export function HomeDashboard({ stats, children }: { stats: HomeView; children: ReactNode }) {
  const t = useTranslations("Home");
  const [guest, setGuest] = useState<HomeView | null>(null);

  useEffect(() => {
    if (stats.signedIn) {
      return;
    }

    let cancelled = false;
    loadExperience()
      .then((experience) => {
        if (cancelled) {
          return;
        }

        setGuest({
          signedIn: false,
          experience: experience.experience,
          days: readLocalPractice(),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setGuest({ signedIn: false, experience: 0, days: readLocalPractice() });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [stats.signedIn]);

  const view = stats.signedIn ? stats : (guest ?? stats);

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 overflow-y-auto">
      <div className="flex flex-col gap-4 ">
        <div className="grid gap-4 grid-cols-2">
          <LevelCard experience={view.experience} />
          {children}
        </div>
        <PracticeChart days={view.days} />
        <AlephBetCard />
      </div>
      {view.signedIn ? null : <p className="text-sm text-emerald-900/70">{t("signInHint")}</p>}
    </main>
  );
}
