import { getTranslations } from "next-intl/server";
import { DeckBrowser } from "@/components/flashcards/deck-browser";
import { DeckPicker } from "@/components/flashcards/deck-picker";
import { FlashcardSession } from "@/components/flashcards/flashcard-session";
import { SiteFrame } from "@/components/site-frame";
import { isBuiltinDeck } from "@/lib/flashcards/builtin";
import { loadLibrary } from "@/lib/flashcards/catalog";
import { mergeDeck } from "@/lib/flashcards/merge";
import type { Flashcard } from "@/lib/flashcards/types";
import { starterDeck } from "@/lib/flashcards/starter-deck";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ deck?: string; view?: string }>;
}) {
  const t = await getTranslations("Flashcards");
  const training = await getTranslations("Training");
  const { deck, view } = await searchParams;
  const library = await loadLibrary(deck);
  const active = await activeDeck(deck, library, t);
  const cards = active?.cards ?? null;
  const browsing = Boolean(active && deck && view === "cards");
  const links = [
    ...(cards ? [{ href: "/", label: t("decks") }] : []),
    { href: "/training", label: training("nav") },
  ];

  return (
    <SiteFrame brand={t("brand")} links={links}>
      {browsing && active ? (
        <DeckBrowser
          deckId={active.id}
          title={active.title}
          description={active.description}
          kind={active.kind}
          cards={active.cards}
        />
      ) : active ? (
        <FlashcardSession key={active.id} deckId={active.id} cards={active.cards} />
      ) : (
        <DeckPicker decks={library.decks} edits={library.edits} tallies={library.tallies} />
      )}
    </SiteFrame>
  );
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
