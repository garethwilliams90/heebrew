import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { starterDeck } from "@/lib/flashcards/starter-deck";

const hebrewFromScratchCount = 4299;

export async function DeckPicker() {
  const t = await getTranslations("Flashcards");

  const decks = [
    {
      id: "nature",
      title: t("natureTitle"),
      description: t("natureDescription"),
      count: starterDeck.length,
    },
    {
      id: "hebrew-from-scratch",
      title: t("scratchTitle"),
      description: t("scratchDescription"),
      count: hebrewFromScratchCount,
    },
  ];

  return (
    <main className="flex flex-1 flex-col px-4 py-8 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">{t("chooseDeck")}</h1>
      <div className="mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        {decks.map((deck) => (
          <article
            key={deck.id}
            className="flex flex-col rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)] transition-transform hover:-translate-y-0.5"
          >
            <Link href={`/?deck=${deck.id}`} className="flex flex-1 flex-col">
              <h2 className="text-xl font-semibold">{deck.title}</h2>
              <p className="mt-2 flex-1 text-emerald-950/70">{deck.description}</p>
              <p className="mt-6 text-sm text-emerald-800">
                {t("cardCount", { count: deck.count })}
              </p>
            </Link>
            <Button
              asChild
              variant="outline"
              className="mt-4 h-11 border-emerald-900/10 bg-white text-emerald-950 hover:bg-emerald-50"
            >
              <Link href={`/?deck=${deck.id}&view=cards`}>{t("viewCards")}</Link>
            </Button>
          </article>
        ))}
      </div>
    </main>
  );
}
