import { Leaf } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AuthButton } from "@/components/auth-button";
import { DeckBrowser } from "@/components/flashcards/deck-browser";
import { DeckPicker } from "@/components/flashcards/deck-picker";
import { FlashcardSession } from "@/components/flashcards/flashcard-session";
import { Link } from "@/i18n/navigation";
import type { Flashcard } from "@/lib/flashcards/types";
import { starterDeck } from "@/lib/flashcards/starter-deck";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ deck?: string; view?: string }>;
}) {
  const t = await getTranslations("Flashcards");
  const { deck, view } = await searchParams;
  const cards = await cardsForDeck(deck);
  const browsing = Boolean(cards && deck && view === "cards");

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-[#f3f6f1] text-emerald-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-emerald-200/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 size-96 rounded-full bg-lime-100/80 blur-3xl"
      />
      <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="size-5 text-emerald-800" aria-hidden />
            <p className="text-lg font-semibold tracking-tight">{t("brand")}</p>
          </Link>
          {cards ? (
            <Link href="/" className="text-sm text-emerald-800">
              {t("decks")}
            </Link>
          ) : null}
        </div>
        <AuthButton />
      </header>
      <div className="relative z-10 flex flex-1 flex-col">
        {browsing && deck && cards ? (
          <DeckBrowser deckId={deck} title={deckTitle(deck, t)} cards={cards} />
        ) : cards && deck ? (
          <FlashcardSession key={deck} deckId={deck} cards={cards} />
        ) : (
          <DeckPicker />
        )}
      </div>
    </div>
  );
}

function deckTitle(
  deck: string,
  t: Awaited<ReturnType<typeof getTranslations<"Flashcards">>>,
) {
  if (deck === "nature") {
    return t("natureTitle");
  }

  if (deck === "hebrew-from-scratch") {
    return t("scratchTitle");
  }

  return t("viewCards");
}

async function cardsForDeck(deck: string | undefined): Promise<Flashcard[] | null> {
  if (deck === "nature") {
    return starterDeck;
  }

  if (deck === "hebrew-from-scratch") {
    const { hebrewFromScratch } = await import("@/lib/flashcards/hebrew-from-scratch");
    return hebrewFromScratch;
  }

  return null;
}
