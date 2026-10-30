"use client";

import { useEffect, useId, useState } from "react";
import { Check, Mars, Plus, Venus, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { GenderMark } from "@/components/flashcards/gender-mark";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import {
  addWordToDeck,
  dictionaryWords,
  loadCustomDecks,
  type DeckChoice,
  type DictionaryEntry,
} from "@/lib/learn/dictionary";
import { isPartOfSpeech, partsOfSpeech, type PartOfSpeech } from "@/lib/flashcards/types";
import { readKnownWords } from "@/lib/learn/known-words";
import { useLocalhost } from "@/components/learn/dev-level";
import { playStudyClip } from "@/lib/learn/pathway/play-study";
import { spokenKey } from "@/lib/stories/cues";
import { cn } from "cn";

type KnowledgeFilter = "all" | "known" | "unknown";
type TypeFilter = "all" | PartOfSpeech;
type DeckStatus = "loading" | "ready" | "signed-out" | "error";

const typeRank = ["noun", "adjective", "verb"];

export function DictionaryPage({ extra = [] }: { extra?: DictionaryEntry[] }) {
  const t = useTranslations("Dictionary");
  const flashcards = useTranslations("Flashcards");
  const local = useLocalhost();
  const [knownIds, setKnownIds] = useState<ReadonlySet<string>>(() => new Set());
  const [picking, setPicking] = useState<DictionaryEntry | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [knowledge, setKnowledge] = useState<KnowledgeFilter>("all");
  const [wordType, setWordType] = useState<TypeFilter>("all");
  const [customDecks, setCustomDecks] = useState<DeckChoice[]>([]);
  const [deckStatus, setDeckStatus] = useState<DeckStatus>("loading");
  const natureTitle = flashcards("natureTitle");
  const scratchTitle = flashcards("scratchTitle");
  const decks = [
    { id: "nature", title: natureTitle },
    { id: "hebrew-from-scratch", title: scratchTitle },
    ...customDecks,
  ];
  const typeOptions = partsOfSpeech
    .filter((part) => dictionaryWords.some((word) => word.partOfSpeech === part) || extra.some((word) => word.partOfSpeech === part))
    .sort((left, right) => {
      const leftRank = typeRank.indexOf(left);
      const rightRank = typeRank.indexOf(right);
      return (leftRank === -1 ? typeRank.length : leftRank) - (rightRank === -1 ? typeRank.length : rightRank);
    });

  useEffect(() => {
    setKnownIds(new Set(readKnownWords().map((word) => word.id)));
  }, []);

  useEffect(() => {
    let current = true;
    loadCustomDecks().then((result) => {
      if (!current) {
        return;
      }
      if (result === "signed-out" || result === "error") {
        setDeckStatus(result);
        return;
      }
      setCustomDecks(result);
      setDeckStatus("ready");
    });
    return () => {
      current = false;
    };
  }, []);

  const knownHebrew = new Set(dictionaryWords.map((word) => spokenKey(word.hebrew)));
  const words = [...dictionaryWords, ...extra.filter((word) => !knownHebrew.has(spokenKey(word.hebrew)))];
  const typed = words.filter((word) => wordType === "all" || word.partOfSpeech === wordType);
  const known = typed.filter((word) => knownIds.has(word.id));
  const unknown = typed.filter((word) => !knownIds.has(word.id));
  const narrowed = knowledge !== "all" || wordType !== "all";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-8 pb-8 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("title")}</h1>
      <p className="mt-2 text-emerald-900/75">{t("description")}</p>
      <div className="sticky top-[-3rem] z-20 -mx-4 mt-4 flex flex-wrap justify-end gap-2 bg-[#f3f6f1]/95 px-4 py-2 backdrop-blur-sm md:top-[-3.5rem] sm:-mx-8 sm:px-8">
        <FilterSelect
          label={t("filterKnown")}
          value={knowledge}
          onChange={(value) => {
            if (value === "all" || value === "known" || value === "unknown") {
              setKnowledge(value);
            }
          }}
          options={[
            { value: "all", label: t("filterAll") },
            { value: "known", label: t("filterKnownOnly") },
            { value: "unknown", label: t("filterUnknownOnly") },
          ]}
        />
        <FilterSelect
          label={t("filterType")}
          value={wordType}
          onChange={(value) => {
            if (value === "all" || isPartOfSpeech(value)) {
              setWordType(value);
            }
          }}
          options={[
            { value: "all", label: t("filterAllTypes") },
            ...typeOptions.map((part) => ({ value: part, label: flashcards(`pos.${part}`) })),
          ]}
        />
      </div>

      {knowledge === "unknown" ? null : (
        <WordSection
          title={t("known")}
          countLabel={t("count", { count: known.length })}
          words={known}
          empty={narrowed ? t("filterEmpty") : t("knownEmpty")}
          known
          notes={notes}
          markUnrecorded={local}
          onAdd={setPicking}
        />
      )}
      {knowledge === "known" ? null : (
        <WordSection
          title={t("unknown")}
          countLabel={t("count", { count: unknown.length })}
          words={unknown}
          empty={narrowed ? t("filterEmpty") : t("unknownEmpty")}
          known={false}
          notes={notes}
          markUnrecorded={local}
          onAdd={setPicking}
        />
      )}

      {picking ? (
        <DeckPicker
          word={picking}
          decks={decks}
          deckStatus={deckStatus}
          onClose={() => setPicking(null)}
          onResult={(message) => setNotes((current) => ({ ...current, [picking.id]: message }))}
        />
      ) : null}
    </main>
  );
}

function WordSection({
  title,
  countLabel,
  words,
  empty,
  known,
  notes,
  markUnrecorded = false,
  onAdd,
}: {
  title: string;
  countLabel: string;
  words: readonly DictionaryEntry[];
  empty: string;
  known: boolean;
  notes: Record<string, string>;
  markUnrecorded?: boolean;
  onAdd: (word: DictionaryEntry) => void;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold text-emerald-950">{title}</h2>
        <p className="text-sm text-emerald-800/70">{countLabel}</p>
      </div>
      {words.length === 0 ? (
        <p className="mt-3 text-sm text-emerald-900/70">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {words.map((word) => (
            <WordRow
              key={word.id}
              word={word}
              known={known}
              note={notes[word.id]}
              markUnrecorded={markUnrecorded}
              onAdd={onAdd}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function WordRow({
  word,
  known,
  note,
  markUnrecorded = false,
  onAdd,
}: {
  word: DictionaryEntry;
  known: boolean;
  note?: string;
  markUnrecorded?: boolean;
  onAdd: (word: DictionaryEntry) => void;
}) {
  const t = useTranslations("Dictionary");
  const [open, setOpen] = useState(false);
  const unrecorded = markUnrecorded && !word.audio;

  return (
    <li
      className={cn(
        "rounded-2xl border bg-white/90 px-4 py-3",
        unrecorded ? "border-amber-400 bg-amber-50/80" : "border-emerald-950/10",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {unrecorded ? (
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-950">Needs recording</span>
            ) : null}
            {known ? (
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <Check className="size-4" aria-hidden />
                <span className="sr-only">{t("knownMark")}</span>
              </span>
            ) : null}
            <span dir="rtl" lang="he" className={cn("text-2xl leading-none text-emerald-950", printFont.className)}>
              {word.hebrew}
            </span>
          </div>
          <p className="mt-1 text-base text-emerald-950">{word.gloss.en}</p>
          {word.transliteration ? <p className="text-sm text-emerald-800/70">{word.transliteration}</p> : null}
          {word.gender ? <GenderMark gender={word.gender} /> : null}
          {word.exampleHebrew ? (
            <p className="mt-1 text-sm text-muted-foreground">
              <span dir="rtl" lang="he" className={printFont.className}>
                {word.exampleHebrew}
              </span>
              {word.exampleGloss ? <span> · {word.exampleGloss}</span> : null}
            </p>
          ) : null}
          {note ? <p className="mt-1 text-sm text-emerald-800">{note}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {word.forms ? (
            <Button
              type="button"
              variant="outline"
              className="h-8 px-2"
              aria-expanded={open}
              aria-label={open ? t("hideForms") : t("showForms")}
              onClick={() => setOpen((current) => !current)}
            >
              <Mars className="size-3.5 text-blue-600" aria-hidden />
              <Venus className="-ms-1 size-3.5 text-pink-500" aria-hidden />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t("hear", { word: word.gloss.en })}
            sound={false}
            onClick={() => void playStudyClip({ hebrew: word.hebrew, audio: word.audio ?? undefined, say: word.hebrew })}
          >
            <Volume2 />
          </Button>
          {known ? null : (
            <Button type="button" variant="outline" size="icon" aria-label={t("add")} onClick={() => onAdd(word)}>
              <Plus className="size-4" />
            </Button>
          )}
        </div>
      </div>
      {open && word.forms ? <FormCards forms={word.forms} /> : null}
    </li>
  );
}

function FormCards({ forms }: { forms: NonNullable<DictionaryEntry["forms"]> }) {
  const t = useTranslations("Dictionary");
  const cards = [
    { key: "masculine", gender: "masculine", number: "singular", hebrew: forms.masculine },
    { key: "feminine", gender: "feminine", number: "singular", hebrew: forms.feminine },
    { key: "masculinePlural", gender: "masculine", number: "plural", hebrew: forms.masculinePlural },
    { key: "femininePlural", gender: "feminine", number: "plural", hebrew: forms.femininePlural },
  ] as const;

  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {cards.map((card) => (
        <li key={card.key}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-2xl border border-emerald-950/10 bg-background px-3 py-2 text-emerald-950 hover:bg-emerald-50"
            aria-label={t("hear", { word: card.hebrew })}
            onClick={() => void playStudyClip({ hebrew: card.hebrew, say: card.hebrew })}
          >
            <GenderMark gender={card.gender} number={card.number} labeled={false} />
            <span dir="rtl" lang="he" className={cn("text-xl leading-none", printFont.className)}>
              {card.hebrew}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function DeckPicker({
  word,
  decks,
  deckStatus,
  onClose,
  onResult,
}: {
  word: DictionaryEntry;
  decks: readonly DeckChoice[];
  deckStatus: DeckStatus;
  onClose: () => void;
  onResult: (message: string) => void;
}) {
  const t = useTranslations("Dictionary");
  const titleId = useId();
  const [status, setStatus] = useState<DeckStatus>(deckStatus);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    setStatus(deckStatus);
  }, [deckStatus]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function choose(deck: DeckChoice) {
    if (saving) {
      return;
    }
    setSaving(deck.id);
    const result = await addWordToDeck(deck.id, word);
    setSaving(null);
    if (result === "ok") {
      onResult(t("added", { deck: deck.title }));
      onClose();
      return;
    }
    if (result === "duplicate") {
      onResult(t("duplicate", { deck: deck.title, word: word.gloss.en }));
      onClose();
      return;
    }
    if (result === "signed-out") {
      setStatus("signed-out");
      return;
    }
    setStatus("error");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-emerald-950/45 p-4 sm:items-center" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[min(32rem,calc(100dvh-2rem))] w-full max-w-md overflow-y-auto rounded-3xl border border-emerald-950/10 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-emerald-950">
          {t("pickDeck")}
        </h2>
        <p className="mt-1 text-sm text-emerald-900/75">{t("pickDeckBody", { word: word.gloss.en })}</p>

        {status === "loading" ? (
          <div className="mt-4 flex flex-col gap-2" role="status" aria-label={t("loadingDecks")}>
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ) : null}
        {status === "signed-out" ? (
          <p className="mt-4 text-sm text-emerald-900">
            <Link href="/login" className="text-emerald-800 underline underline-offset-2">
              {t("signedOut")}
            </Link>
          </p>
        ) : null}
        {status === "error" ? (
          <p className="mt-4 text-sm text-red-800" role="alert">
            {t("saveError")}
          </p>
        ) : null}
        {status === "ready" && decks ? (
          <ul className="mt-4 flex flex-col gap-2">
            {decks.map((deck) => (
              <li key={deck.id}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto w-full justify-start rounded-2xl px-4 py-3 text-left whitespace-normal"
                  disabled={saving !== null}
                  onClick={() => void choose(deck)}
                >
                  {saving === deck.id ? t("adding") : deck.title}
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
