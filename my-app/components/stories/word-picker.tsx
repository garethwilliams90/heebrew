"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { addWord, createWordDeck, deleteWord, type WordActionState } from "@/lib/stories/words";
import type { WordView } from "@/lib/stories/queries";
import { cn } from "cn";

const idle: WordActionState = { error: "", deckId: "" };

const fieldClass =
  "w-full rounded-lg border border-emerald-950/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30";

export function WordPicker({ storyId, phrase, words }: { storyId: string; phrase: string; words: WordView[] }) {
  const t = useTranslations("Stories");
  const [addState, addAction, adding] = useActionState(addWord, idle);
  const [deckState, deckAction, making] = useActionState(createWordDeck, idle);

  return (
    <div className="flex flex-col gap-3">
      {phrase ? (
        <form action={addAction} className="flex flex-col gap-2">
          <input type="hidden" name="storyId" value={storyId} />
          <input type="hidden" name="phrase" value={phrase} />
          <p dir="rtl" lang="he" className={cn(printFont.className, "text-xl")}>
            {phrase}
          </p>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("wordLabel")}
            <input className={fieldClass} name="label" required maxLength={200} />
          </label>
          {addState.error ? <p className="text-sm text-red-800">{t(addState.error === "invalid" ? "wordEmpty" : addState.error)}</p> : null}
          <Button type="submit" disabled={adding} className="self-start">
            {adding ? t("saving") : t("addWord")}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-emerald-900/70">{t("wordHint")}</p>
      )}
      {words.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {words.map((word) => (
            <li key={word.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                <span dir="rtl" lang="he" className={printFont.className}>
                  {word.phrase}
                </span>
                {" · "}
                {word.label}
              </span>
              <form action={deleteWord}>
                <input type="hidden" name="id" value={word.id} />
                <Button type="submit" variant="outline" size="sm">
                  {t("removeWord")}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}
      <form action={deckAction}>
        <input type="hidden" name="storyId" value={storyId} />
        {deckState.error ? (
          <p className="mb-2 text-sm text-red-800">{t(deckState.error === "empty" || deckState.error === "invalid" ? "wordEmpty" : deckState.error)}</p>
        ) : null}
        {deckState.deckId ? (
          <p className="mb-2 text-sm">
            <Link href={`/decks?deck=${deckState.deckId}&view=cards`} className="text-emerald-800 underline underline-offset-2">
              {t("deckReady")}
            </Link>
          </p>
        ) : null}
        <Button type="submit" disabled={making || words.length === 0} variant="outline">
          {making ? t("saving") : t("createDeck")}
        </Button>
      </form>
    </div>
  );
}
