import { getTranslations } from "next-intl/server";
import { DeckHeading } from "@/components/flashcards/deck-heading";
import { NewDeckForm } from "@/components/flashcards/new-deck-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { BuiltinDeckId } from "@/lib/flashcards/builtin";
import type { CardTally, CustomDeck, DeckEdit } from "@/lib/flashcards/catalog";
import { starterDeck } from "@/lib/flashcards/starter-deck";

const hebrewFromScratchCount = 4299;

export async function DeckPicker({
  decks,
  edits,
  tallies,
}: {
  decks: CustomDeck[];
  edits: Partial<Record<BuiltinDeckId, DeckEdit>>;
  tallies: Partial<Record<string, CardTally>>;
}) {
  const t = await getTranslations("Flashcards");

  const builtin = [
    {
      id: "nature" as const,
      title: edits.nature?.title ?? t("natureTitle"),
      description: edits.nature?.description ?? t("natureDescription"),
      count: Math.max(
        0,
        starterDeck.length - (tallies.nature?.hidden ?? 0) + (tallies.nature?.added ?? 0),
      ),
    },
    {
      id: "hebrew-from-scratch" as const,
      title: edits["hebrew-from-scratch"]?.title ?? t("scratchTitle"),
      description: edits["hebrew-from-scratch"]?.description ?? t("scratchDescription"),
      count: Math.max(
        0,
        hebrewFromScratchCount -
          (tallies["hebrew-from-scratch"]?.hidden ?? 0) +
          (tallies["hebrew-from-scratch"]?.added ?? 0),
      ),
    },
  ];

  const custom = decks.map((deck) => ({
    id: deck.id,
    kind: "custom" as const,
    title: deck.title,
    description: deck.description,
    count: tallies[deck.id]?.added ?? 0,
  }));

  return (
    <main className="flex flex-1 flex-col px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{t("chooseDeck")}</h1>
        <NewDeckForm />
      </div>
      <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
        {[...builtin, ...custom].map((deck) => (
          <article
            key={deck.id}
            className="flex flex-col rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)]"
          >
            <DeckHeading
              deckId={deck.id}
              title={deck.title}
              description={deck.description}
              canDelete={"kind" in deck && deck.kind === "custom"}
              level="h2"
              titleClassName="text-xl font-semibold"
              descriptionClassName="mt-2 text-emerald-950/70"
            />
            <p className="mt-6 text-sm text-emerald-800">{t("cardCount", { count: deck.count })}</p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button asChild size="lg">
                <Link href={`/decks?deck=${deck.id}`}>{t("study")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/decks?deck=${deck.id}&view=cards`}>{t("viewCards")}</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
