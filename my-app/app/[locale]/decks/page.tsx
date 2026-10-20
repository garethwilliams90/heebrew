import { getTranslations } from "next-intl/server";
import { DeckBrowser } from "@/components/flashcards/deck-browser";
import { DeckPicker } from "@/components/flashcards/deck-picker";
import { FlashcardSession } from "@/components/flashcards/flashcard-session";
import { StudySetup } from "@/components/flashcards/study-setup";
import { isBuiltinDeck } from "@/lib/flashcards/builtin";
import { loadLibrary } from "@/lib/flashcards/catalog";
import { mergeDeck } from "@/lib/flashcards/merge";
import type { Flashcard } from "@/lib/flashcards/types";
import { starterDeck } from "@/lib/flashcards/starter-deck";
import { parseStudyCount, parseStudyMode } from "@/lib/flashcards/study-plan";
import { KnownWordsStudy } from "@/components/learn/known-words-study";

export default async function DecksPage({
  searchParams,
}: {
  searchParams: Promise<{ deck?: string; view?: string; mode?: string; count?: string }>;
}) {
  const t = await getTranslations("Flashcards");
  const { deck, view, mode, count } = await searchParams;
  if (deck === "known-words") {
    return <KnownWordsStudy view={view} mode={mode} count={count} />;
  }
  const library = await loadLibrary(deck);
  const active = await activeDeck(deck, library, t);

  if (!active) {
    return (
      <DeckPicker
        decks={library.decks}
        edits={library.edits}
        tallies={library.tallies}
        signedIn={library.signedIn}
      />
    );
  }

  if (view === "cards") {
    return (
      <DeckBrowser
        deckId={active.id}
        title={active.title}
        description={active.description}
        kind={active.kind}
        cards={active.cards}
      />
    );
  }

  if (view === "study") {
    const studyMode = parseStudyMode(mode);
    const studyCount = parseStudyCount(count);
    return (
      <FlashcardSession
        key={`${active.id}:${studyMode}:${studyCount}`}
        deckId={active.id}
        cards={active.cards}
        mode={studyMode}
        count={studyCount}
      />
    );
  }

  return <StudySetup deckId={active.id} title={active.title} cards={active.cards} />;
}

async function activeDeck(
  deck: string | undefined,
  library: Awaited<ReturnType<typeof loadLibrary>>,
  t: Awaited<ReturnType<typeof getTranslations<"Flashcards">>>,
) {
  if (!deck) {
    return null;
  }

  if (isBuiltinDeck(deck)) {
    const base = await baseCards(deck);
    const edit = library.edits[deck];
    return {
      id: deck,
      kind: "builtin" as const,
      title: edit?.title ?? (deck === "nature" ? t("natureTitle") : t("scratchTitle")),
      description: edit?.description ?? (deck === "nature" ? t("natureDescription") : t("scratchDescription")),
      cards: mergeDeck(base, library.storedCards),
    };
  }

  const custom = library.decks.find((item) => item.id === deck);
  if (!custom) {
    return null;
  }

  return {
    id: custom.id,
    kind: "custom" as const,
    title: custom.title,
    description: custom.description,
    cards: mergeDeck([], library.storedCards),
  };
}

async function baseCards(deck: "nature" | "hebrew-from-scratch"): Promise<Flashcard[]> {
  if (deck === "nature") {
    return starterDeck;
  }

  const { hebrewFromScratch } = await import("@/lib/flashcards/hebrew-from-scratch");
  return hebrewFromScratch;
}
