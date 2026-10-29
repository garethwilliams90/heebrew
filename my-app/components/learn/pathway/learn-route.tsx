"use client";

import dynamic from "next/dynamic";
import { RouteSkeleton } from "@/components/loading/route-skeleton";

function studyFallback() {
  return <RouteSkeleton kind="study" />;
}

export const LevelRunner = dynamic(() => import("@/components/learn/pathway/level-runner").then((mod) => mod.LevelRunner), {
  loading: studyFallback,
});

export const SectionExam = dynamic(() => import("@/components/learn/pathway/section-exam").then((mod) => mod.SectionExam), {
  loading: studyFallback,
});
