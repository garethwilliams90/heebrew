"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DeckBrowser } from "@/components/flashcards/deck-browser";
import { FlashcardSession } from "@/components/flashcards/flashcard-session";
import { StudySetup } from "@/components/flashcards/study-setup";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { toFlashcard } from "@/lib/learn/basic-words";
import { readKnownWords } from "@/lib/learn/known-words";
import { parseStudyCount, parseStudyMode } from "@/lib/flashcards/study-plan";

export const knownWordsDeckId = "known-words";

export function KnownWordsDeckCard() {
  const t = useTranslations("Learn");
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(readKnownWords().length);
  }, []);

  if (count === 0) {
    return null;
  }

  return (
    <article className="flex flex-col rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)]">
      <h2 className="text-xl font-semibold">{t("knownDeckTitle")}</h2>
      <p className="mt-2 text-emerald-950/70">{t("knownDeckBody")}</p>
      <p className="mt-6 text-sm text-emerald-800">{t("knownDeckCount", { count })}</p>
      <div className="mt-4 flex justify-end">
        <Button asChild size="lg">
          <Link href={`/decks?deck=${knownWordsDeckId}&view=setup`}>{t("knownDeckStudy")}</Link>
        </Button>
      </div>
    </article>
  );
}

export function KnownWordsStudy({
  view,
  mode,
  count,
}: {
  view?: string;
  mode?: string;
  count?: string;
}) {
  const t = useTranslations("Learn");
  const [cards, setCards] = useState(() => readKnownWords().map(toFlashcard));

  useEffect(() => {
    setCards(readKnownWords().map(toFlashcard));
  }, []);

  if (view === "study") {
    return (
      <FlashcardSession
        deckId={knownWordsDeckId}
        cards={cards}
        mode={parseStudyMode(mode)}
        count={parseStudyCount(count)}
      />
    );
  }

  if (view === "cards") {
    return (
      <DeckBrowser
        deckId={knownWordsDeckId}
        title={t("knownDeckTitle")}
        description={t("knownDeckBody")}
        kind="custom"
        cards={cards}
      />
    );
  }

  return <StudySetup deckId={knownWordsDeckId} title={t("knownDeckTitle")} cards={cards} />;
}
