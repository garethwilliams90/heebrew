"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/flashcards/form-dialog";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ANKI_EXAMPLE_LIMIT,
  ANKI_PACKAGE_LIMIT,
  ANKI_TEXT_LIMIT,
  issueFor,
  type AnkiField,
  type AnkiIssue,
} from "@/lib/flashcards/anki-note";

type PreviewCard = {
  id: string;
  fields: AnkiField[];
  english: string;
  hebrew: string;
  example: string;
  hebrewExample: string;
};

type PreviewDeck = {
  id: string;
  name: string;
  cards: PreviewCard[];
};

type DraftCard = PreviewCard & {
  number: number;
};

type PackageError = "not-apkg" | "unreadable" | "empty" | "too-big" | "too-many" | "signed-out";

const issueMessage = {
  "missing-english": "issueMissingEnglish",
  "missing-hebrew": "issueMissingHebrew",
  ambiguous: "issueAmbiguous",
  "too-long": "issueTooLong",
  empty: "issueEmpty",
} as const;

const packageMessage = {
  "not-apkg": "ankiNotApkg",
  unreadable: "ankiUnreadable",
  empty: "ankiEmpty",
  "too-big": "ankiTooBig",
  "too-many": "ankiTooMany",
  "signed-out": "ankiSignIn",
} as const;

export function AnkiImport({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("Flashcards");
  const tAuth = useTranslations("Auth");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [packageError, setPackageError] = useState<PackageError | null>(null);
  const [saveError, setSaveError] = useState<"signed-out" | "error" | null>(null);
  const [fileName, setFileName] = useState("");
  const [decks, setDecks] = useState<PreviewDeck[]>([]);
  const [deckId, setDeckId] = useState<string | null>(null);
  const [cards, setCards] = useState<DraftCard[] | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const fileRef = useRef<File | null>(null);

  const review = useMemo(() => {
    if (!cards) {
      return null;
    }

    const issues = cards.flatMap((card) => {
      const issue = issueFor(card.english, card.hebrew, card.example, card.hebrewExample);
      return issue ? [{ card, issue }] : [];
    });

    return { issues, ready: cards.length - issues.length };
  }, [cards]);

  function close() {
    setOpen(false);
    setReading(false);
    setSaving(false);
    setPackageError(null);
    setSaveError(null);
    setFileName("");
    setDecks([]);
    setDeckId(null);
    setCards(null);
    setTitle("");
    setDescription("");
    fileRef.current = null;
  }

  function chooseDeck(deck: PreviewDeck, sourceName: string) {
    setCards(
      deck.cards.map((card, index) => ({
        ...card,
        number: index + 1,
      })),
    );
    setTitle(deckTitle(deck.name, sourceName));
    setDescription(t("ankiImported"));
    setDecks([]);
  }

  async function readFile(file: File) {
    setPackageError(null);
    setSaveError(null);
    setCards(null);
    setDecks([]);
    setDeckId(null);
    setFileName(file.name);
    fileRef.current = file;

    if (!file.name.toLowerCase().endsWith(".apkg")) {
      setPackageError("not-apkg");
      return;
    }

    if (file.size > ANKI_PACKAGE_LIMIT) {
      setPackageError("too-big");
      return;
    }

    setReading(true);
    const body = new FormData();
    body.set("file", file);
    let response: Response;
    try {
      response = await fetch("/api/anki/preview", { method: "POST", body });
    } catch {
      setReading(false);
      setPackageError("unreadable");
      return;
    }
    setReading(false);

    const payload = (await response.json().catch(() => null)) as { error?: string; decks?: unknown } | null;
    if (!response.ok) {
      setPackageError(knownPackageError(payload?.error));
      return;
    }

    const parsed = parseDecks(payload?.decks);
    if (parsed.length === 0) {
      setPackageError("empty");
      return;
    }

    if (parsed.length === 1) {
      chooseDeck(parsed[0], file.name);
      return;
    }

    setDecks(parsed);
  }

  function updateCard(id: string, side: "english" | "hebrew" | "example" | "hebrewExample", value: string) {
    setCards((current) =>
      current?.map((card) => (card.id === id ? { ...card, [side]: value } : card)) ?? null,
    );
  }

  async function save() {
    if (!cards || !review || review.issues.length > 0 || review.ready === 0 || !title.trim()) {
      return;
    }

    const file = fileRef.current;
    if (!file) {
      setSaveError("error");
      return;
    }

    setSaving(true);
    setSaveError(null);
    const body = new FormData();
    body.set("file", file);
    body.set(
      "cards",
      JSON.stringify({
        title,
        description,
        cards: cards.map((card) => ({
          id: card.id,
          english: card.english,
          hebrew: card.hebrew,
          example: card.example,
          hebrewExample: card.hebrewExample,
        })),
      }),
    );

    let response: Response;
    try {
      response = await fetch("/api/anki/import", { method: "POST", body });
    } catch {
      setSaving(false);
      setSaveError("error");
      return;
    }

    const payload = (await response.json().catch(() => null)) as { id?: unknown; error?: unknown } | null;
    setSaving(false);

    if (response.ok && typeof payload?.id === "string") {
      close();
      router.push(`/decks?deck=${payload.id}&view=cards`);
      router.refresh();
      return;
    }

    setSaveError(payload?.error === "signed-out" ? "signed-out" : "error");
  }

  const canImport = Boolean(review && review.issues.length === 0 && review.ready > 0 && title.trim() && !saving);

  return (
    <>
      <Button type="button" variant="outline" size="lg" onClick={() => setOpen(true)}>
        {t("importAnki")}
      </Button>
      {open ? (
        <FormDialog label={t("importAnki")} onClose={close} className="w-full max-w-2xl">
          <div className="w-full rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(6,78,59,0.45)]">
            <h2 className="text-xl font-semibold">{t("importAnki")}</h2>
            <p className="mt-2 text-sm text-emerald-950/70">{t("ankiHint")}</p>

            {signedIn ? null : (
              <p className="mt-4 text-sm text-emerald-900/70">
                {t("ankiSignIn")}{" "}
                <Link href="/login" className="text-emerald-800 underline underline-offset-2">
                  {tAuth("login")}
                </Link>
              </p>
            )}

            {signedIn && !cards && decks.length === 0 ? (
              <div className="mt-4 flex flex-col gap-2">
                <Label htmlFor="anki-file">{t("ankiFile")}</Label>
                <Input
                  id="anki-file"
                  type="file"
                  accept=".apkg,application/octet-stream"
                  disabled={reading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) {
                      void readFile(file);
                    }
                  }}
                  className="h-11 border-emerald-900/10 bg-white file:mr-3 file:text-sm file:font-medium"
                />
                {reading ? <p className="text-sm text-emerald-800">{t("ankiReading")}</p> : null}
              </div>
            ) : null}

            {decks.length > 1 ? (
              <fieldset className="mt-4 flex flex-col gap-2">
                <legend className="text-sm font-medium">{t("ankiChoose")}</legend>
                {decks.map((deck) => (
                  <label
                    key={deck.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-950/10 px-4 py-3 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="anki-deck"
                        checked={deckId === deck.id}
                        onChange={() => setDeckId(deck.id)}
                      />
                      {deck.name}
                    </span>
                    <span className="text-emerald-800">{t("cardCount", { count: deck.cards.length })}</span>
                  </label>
                ))}
              </fieldset>
            ) : null}

            {review && cards ? (
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="anki-title">{t("deckTitle")}</Label>
                  <Input
                    id="anki-title"
                    value={title}
                    maxLength={80}
                    onChange={(event) => setTitle(event.target.value)}
                    className="h-11 border-emerald-900/10 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="anki-description">
                    {t("deckDescription")}{" "}
                    <span className="font-normal text-emerald-900/60">({t("optional")})</span>
                  </Label>
                  <textarea
                    id="anki-description"
                    value={description}
                    maxLength={400}
                    onChange={(event) => setDescription(event.target.value)}
                    className="min-h-20 rounded-lg border border-emerald-900/10 bg-white px-3 py-2 text-sm"
                  />
                </div>

                {review.issues.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-orange-950">{t("ankiIssues", { count: review.issues.length })}</p>
                        <p className="mt-1 text-sm text-emerald-950/70">{t("ankiIssueHint")}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setCards(
                            (current) =>
                              current?.filter(
                                (card) => issueFor(card.english, card.hebrew, card.example, card.hebrewExample) === null,
                              ) ?? null,
                          )
                        }
                      >
                        {t("ankiLeaveIssues")}
                      </Button>
                    </div>
                    {review.issues.map(({ card, issue }) => (
                      <IssueCard
                        key={card.id}
                        card={card}
                        issue={issue}
                        onEnglish={(value) => updateCard(card.id, "english", value)}
                        onHebrew={(value) => updateCard(card.id, "hebrew", value)}
                        onExample={(value) => updateCard(card.id, "example", value)}
                        onHebrewExample={(value) => updateCard(card.id, "hebrewExample", value)}
                        onRemove={() => setCards((current) => current?.filter((item) => item.id !== card.id) ?? null)}
                      />
                    ))}
                  </div>
                ) : null}

                <p className="text-sm text-emerald-800">{t("ankiReady", { count: review.ready })}</p>
              </div>
            ) : null}

            {packageError ? (
              <p className="mt-3 text-sm text-red-800" role="alert">
                {t(packageMessage[packageError])}
              </p>
            ) : null}
            {saveError === "signed-out" ? (
              <p className="mt-3 text-sm text-emerald-900/70">{t("ankiSignIn")}</p>
            ) : null}
            {saveError === "error" ? (
              <p className="mt-3 text-sm text-red-800" role="alert">
                {t("libraryError")}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {decks.length > 1 ? (
                <Button
                  type="button"
                  size="lg"
                  disabled={!deckId}
                  onClick={() => {
                    const deck = decks.find((item) => item.id === deckId);
                    if (deck) {
                      chooseDeck(deck, fileName);
                    }
                  }}
                >
                  {t("ankiReview")}
                </Button>
              ) : null}
              {review ? (
                <Button type="button" size="lg" disabled={!canImport} onClick={() => void save()}>
                  {saving ? t("saving") : t("ankiImport", { count: review.ready })}
                </Button>
              ) : null}
              <Button type="button" variant="outline" size="lg" onClick={close}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        </FormDialog>
      ) : null}
    </>
  );
}

function IssueCard({
  card,
  issue,
  onEnglish,
  onHebrew,
  onExample,
  onHebrewExample,
  onRemove,
}: {
  card: DraftCard;
  issue: AnkiIssue;
  onEnglish: (value: string) => void;
  onHebrew: (value: string) => void;
  onExample: (value: string) => void;
  onHebrewExample: (value: string) => void;
  onRemove: () => void;
}) {
  const t = useTranslations("Flashcards");

  return (
    <article className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-orange-950">{t("ankiCard", { number: card.number })}</h3>
        <Button type="button" variant="outline" size="sm" onClick={onRemove}>
          {t("ankiLeaveOut")}
        </Button>
      </div>
      <p className="mt-2 text-sm text-orange-950">{t(issueMessage[issue])}</p>
      {card.fields.length > 0 ? (
        <div className="mt-3 flex flex-col gap-1">
          <p className="text-xs font-medium text-emerald-900/60">{t("ankiOriginal")}</p>
          {card.fields.map((field, index) => {
            const hebrew = /\p{Script=Hebrew}/u.test(field.text);
            return (
              <p
                key={`${field.name}-${index}`}
                dir={hebrew ? "rtl" : undefined}
                lang={hebrew ? "he" : undefined}
                className="text-sm text-emerald-950"
              >
                <span className="text-emerald-900/60">{field.name}: </span>
                {field.text}
              </p>
            );
          })}
        </div>
      ) : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`anki-en-${card.id}`}>{t("englishWord")}</Label>
          <Input
            id={`anki-en-${card.id}`}
            value={card.english}
            maxLength={ANKI_TEXT_LIMIT}
            onChange={(event) => onEnglish(event.target.value)}
            className="h-11 border-orange-200 bg-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`anki-he-${card.id}`}>{t("hebrewWord")}</Label>
          <Input
            id={`anki-he-${card.id}`}
            value={card.hebrew}
            maxLength={ANKI_TEXT_LIMIT}
            dir="rtl"
            lang="he"
            onChange={(event) => onHebrew(event.target.value)}
            className="h-11 border-orange-200 bg-white"
          />
        </div>
      </div>
      {card.example || card.hebrewExample ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`anki-example-${card.id}`}>
              {t("exampleSentence")}{" "}
              <span className="font-normal text-emerald-900/60">({t("optional")})</span>
            </Label>
            <Input
              id={`anki-example-${card.id}`}
              value={card.example}
              maxLength={ANKI_EXAMPLE_LIMIT}
              onChange={(event) => onExample(event.target.value)}
              className="h-11 border-orange-200 bg-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`anki-he-example-${card.id}`}>
              {t("hebrewSentence")}{" "}
              <span className="font-normal text-emerald-900/60">({t("optional")})</span>
            </Label>
            <Input
              id={`anki-he-example-${card.id}`}
              value={card.hebrewExample}
              maxLength={ANKI_EXAMPLE_LIMIT}
              dir="rtl"
              lang="he"
              onChange={(event) => onHebrewExample(event.target.value)}
              className="h-11 border-orange-200 bg-white"
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}

function deckTitle(name: string, fileName: string) {
  const trimmed = name.trim();
  const fromFile = fileName.replace(/\.apkg$/i, "").replace(/[_-]+/g, " ").trim();
  const title = !trimmed || trimmed.toLowerCase() === "default" ? fromFile : trimmed;
  return (title || fromFile || "Anki").slice(0, 80);
}

function knownPackageError(value: string | undefined): PackageError {
  if (
    value === "not-apkg" ||
    value === "unreadable" ||
    value === "empty" ||
    value === "too-big" ||
    value === "too-many" ||
    value === "signed-out"
  ) {
    return value;
  }

  return "unreadable";
}

function parseDecks(value: unknown): PreviewDeck[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((deck) => {
    if (!deck || typeof deck !== "object") {
      return [];
    }

    const item = deck as { id?: unknown; name?: unknown; cards?: unknown };
    if (typeof item.id !== "string" || typeof item.name !== "string" || !Array.isArray(item.cards)) {
      return [];
    }

    const cards = item.cards.flatMap((card) => {
      if (!card || typeof card !== "object") {
        return [];
      }

      const note = card as {
        id?: unknown;
        english?: unknown;
        hebrew?: unknown;
        example?: unknown;
        hebrewExample?: unknown;
        fields?: unknown;
      };
      if (typeof note.id !== "string") {
        return [];
      }

      const fields = Array.isArray(note.fields)
        ? note.fields.flatMap((field) => {
            if (!field || typeof field !== "object") {
              return [];
            }
            const entry = field as { name?: unknown; text?: unknown };
            if (typeof entry.name !== "string" || typeof entry.text !== "string" || !entry.text) {
              return [];
            }
            return [{ name: entry.name, text: entry.text }];
          })
        : [];

      return [
        {
          id: note.id,
          english: typeof note.english === "string" ? note.english : "",
          hebrew: typeof note.hebrew === "string" ? note.hebrew : "",
          example: typeof note.example === "string" ? note.example : "",
          hebrewExample: typeof note.hebrewExample === "string" ? note.hebrewExample : "",
          fields,
        },
      ];
    });

    return cards.length > 0 ? [{ id: item.id, name: item.name, cards }] : [];
  });
}
