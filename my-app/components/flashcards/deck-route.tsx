"use client";

import dynamic from "next/dynamic";
import { RouteSkeleton } from "@/components/loading/route-skeleton";

function studyFallback() {
  return <RouteSkeleton kind="study" />;
}

function pageFallback() {
  return <RouteSkeleton kind="page" />;
}

export const DeckBrowser = dynamic(() => import("@/components/flashcards/deck-browser").then((mod) => mod.DeckBrowser), {
  loading: pageFallback,
});

export const FlashcardSession = dynamic(
  () => import("@/components/flashcards/flashcard-session").then((mod) => mod.FlashcardSession),
  { loading: studyFallback },
);

export const StudySetup = dynamic(() => import("@/components/flashcards/study-setup").then((mod) => mod.StudySetup), {
  loading: pageFallback,
});

export const KnownWordsStudy = dynamic(
  () => import("@/components/learn/known-words-study").then((mod) => mod.KnownWordsStudy),
  { loading: studyFallback },
);
