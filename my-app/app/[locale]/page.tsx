import { Leaf } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AuthButton } from "@/components/auth-button";
import { DeckBrowser } from "@/components/flashcards/deck-browser";
import { DeckPicker } from "@/components/flashcards/deck-picker";
import { FlashcardSession } from "@/components/flashcards/flashcard-session";
import { Link } from "@/i18n/navigation";
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
  const { deck, view } = await searchParams;
  const library = await loadLibrary(deck);
  const active = await activeDeck(deck, library, t);
  const cards = active?.cards ?? null;
  const browsing = Boolean(active && deck && view === "cards");

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
      </div>
    </div>
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
