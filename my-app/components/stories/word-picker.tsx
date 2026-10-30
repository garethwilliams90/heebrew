"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { GenderMark } from "@/components/flashcards/gender-mark";
import { ink } from "@/components/stories/ink";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { exampleFromStory, inferHebrewGender } from "@/lib/stories/word-facts";
import { createWordDeck, deleteWord, saveWords, type WordActionState } from "@/lib/stories/words";
import type { WordView } from "@/lib/stories/queries";
import { cn } from "cn";

const idle: WordActionState = { error: "", deckId: "" };

const card = "rounded-3xl border border-emerald-950/10 bg-white/90 p-5";

export function WordPicker({
  storyId,
  words,
  hebrew,
  gloss,
  initialPhrase = "",
}: {
  storyId: string;
  words: WordView[];
  hebrew: string;
  gloss: string;
  initialPhrase?: string;
}) {
  const t = useTranslations("Stories");
  const [labels, setLabels] = useState(() => words.map((word) => ({ id: word.id, label: word.label })));
  const [phrase, setPhrase] = useState(initialPhrase);
  const [newLabel, setNewLabel] = useState("");
  const [saveState, saveAction, saving] = useActionState(saveWords, idle);
  const [deckState, deckAction, making] = useActionState(createWordDeck, idle);
  const phrases = new Map(words.map((word) => [word.id, word.phrase]));

  useEffect(() => {
    if (initialPhrase) {
      setPhrase(initialPhrase);
    }
  }, [initialPhrase]);

  return (
    <div className="flex flex-col gap-3">
      <form action={saveAction} className="flex flex-col gap-3">
        <input type="hidden" name="storyId" value={storyId} />
        <input type="hidden" name="labels" value={JSON.stringify(labels)} />
        <input type="hidden" name="phrase" value={phrase} />
        <input type="hidden" name="label" value={newLabel} />
        <ul className="flex flex-col gap-3">
          {labels.map((word, index) => (
            <li key={word.id} className={card}>
              <input
                className={cn(ink, "text-2xl font-semibold")}
                value={word.label}
                maxLength={200}
                aria-label={t("wordLabel")}
                onChange={(event) =>
                  setLabels((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, label: event.target.value } : item)))
                }
              />
              <p dir="rtl" lang="he" translate="no" className={cn(printFont.className, "mt-4 text-3xl")}>
                {phrases.get(word.id)}
              </p>
              <WordFacts phrase={phrases.get(word.id) ?? ""} hebrew={hebrew} gloss={gloss} />
              <Button type="submit" form={`remove-word-${word.id}`} variant="outline" size="sm" className="mt-3">
                {t("removeWord")}
              </Button>
            </li>
          ))}
          <li className={card}>
            <input
              className={cn(ink, "text-2xl font-semibold")}
              value={newLabel}
              maxLength={200}
              placeholder={t("wordLabel")}
              aria-label={t("wordLabel")}
              onChange={(event) => setNewLabel(event.target.value)}
            />
            <input
              dir="rtl"
              lang="he"
              translate="no"
              className={cn(ink, printFont.className, "mt-4 text-3xl")}
              value={phrase}
              maxLength={200}
              placeholder={t("wordHint")}
              aria-label={t("hebrewLabel")}
              onChange={(event) => setPhrase(event.target.value)}
            />
            {phrase.trim() ? <WordFacts phrase={phrase} hebrew={hebrew} gloss={gloss} /> : null}
          </li>
        </ul>
        {saveState.error ? (
          <p className="text-sm text-destructive">{t(saveState.error === "invalid" ? "wordEmpty" : saveState.error)}</p>
        ) : null}
        <Button type="submit" disabled={saving} className="self-start">
          {saving ? t("saving") : t("save")}
        </Button>
      </form>
      {words.map((word) => (
        <form key={word.id} id={`remove-word-${word.id}`} action={deleteWord}>
          <input type="hidden" name="id" value={word.id} />
        </form>
      ))}
      <form action={deckAction}>
        <input type="hidden" name="storyId" value={storyId} />
        {deckState.error ? (
          <p className="mb-2 text-sm text-destructive">{t(deckState.error === "empty" || deckState.error === "invalid" ? "wordEmpty" : deckState.error)}</p>
        ) : null}
        {deckState.deckId ? (
          <p className="mb-2 text-sm">
            <Link href={`/decks?deck=${deckState.deckId}&view=cards`} className="underline underline-offset-2">
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

function WordFacts({ phrase, hebrew, gloss }: { phrase: string; hebrew: string; gloss: string }) {
  const t = useTranslations("Stories");
  const gender = inferHebrewGender(phrase);
  const example = exampleFromStory(hebrew, gloss, phrase);
  if (!gender && !example) {
    return null;
  }
  return (
    <div className="mt-3 flex flex-col gap-1">
      {gender ? <GenderMark gender={gender} /> : null}
      {example ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{t("fromStory")} </span>
          <span dir="rtl" lang="he" translate="no" className={printFont.className}>
            {example.hebrew}
          </span>
          {example.gloss ? <span> · {example.gloss}</span> : null}
        </p>
      ) : null}
    </div>
  );
}
