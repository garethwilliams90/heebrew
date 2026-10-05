"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasNiqqud, stripNiqqud } from "@/lib/flashcards/bold";
import { saveCard, type CardDraft } from "@/lib/flashcards/library";
import {
  partsOfSpeech,
  type Flashcard,
  type GrammaticalGender,
  type PartOfSpeech,
} from "@/lib/flashcards/types";

const fieldClass = "h-11 border-emerald-900/10 bg-white";

export function CardEditor({
  deckId,
  card,
  onClose,
  onSaved,
}: {
  deckId: string;
  card: Flashcard | null;
  onClose: () => void;
  onSaved: (result: "ok" | "signed-out" | "error") => void;
}) {
  const t = useTranslations("Flashcards");
  const [english, setEnglish] = useState(card?.english ?? "");
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>(card?.partOfSpeech ?? "noun");
  const [example, setExample] = useState(card?.example ?? "");
  const [hebrew, setHebrew] = useState(card?.hebrew ?? "");
  const [hebrewExample, setHebrewExample] = useState(card?.hebrewExample ?? "");
  const [gender, setGender] = useState<GrammaticalGender | "">(card?.gender ?? "");
  const [nikud, setNikud] = useState(
    hasNiqqud(card?.hebrew ?? "") || hasNiqqud(card?.hebrewExample ?? ""),
  );
  const vocalized = useRef({
    hebrew: hasNiqqud(card?.hebrew ?? "") ? (card?.hebrew ?? "") : "",
    example: hasNiqqud(card?.hebrewExample ?? "") ? (card?.hebrewExample ?? "") : "",
  });
  const [suggesting, setSuggesting] = useState(false);
  const [pointing, setPointing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"suggest" | "required" | "signed-out" | "error" | null>(null);

  async function suggest() {
    const word = english.trim();
    if (!word) {
      setMessage("required");
      return;
    }

    setSuggesting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/cards/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ english: word, example }),
      });

      if (response.status === 401) {
        setMessage("signed-out");
        return;
      }

      if (!response.ok) {
        setMessage("suggest");
        return;
      }

      const payload = (await response.json()) as {
        hebrew?: unknown;
        hebrewExample?: unknown;
        gender?: unknown;
      };

      const pointedWord = typeof payload.hebrew === "string" ? payload.hebrew : "";
      const pointedExample = typeof payload.hebrewExample === "string" ? payload.hebrewExample : "";
      vocalized.current = { hebrew: pointedWord, example: pointedExample };
      if (pointedWord) {
        setHebrew(nikud ? pointedWord : stripNiqqud(pointedWord));
      }
      setHebrewExample(nikud ? pointedExample : stripNiqqud(pointedExample));
      setGender(payload.gender === "masculine" || payload.gender === "feminine" ? payload.gender : "");
    } catch {
      setMessage("suggest");
    } finally {
      setSuggesting(false);
    }
  }

  function remember(field: "hebrew" | "example", value: string) {
    if (nikud) {
      vocalized.current[field] = value;
      return;
    }
    if (stripNiqqud(vocalized.current[field]) !== value) {
      vocalized.current[field] = "";
    }
  }

  function restored(stored: string, current: string) {
    if (!current.trim()) {
      return "";
    }
    if (hasNiqqud(current)) {
      return current;
    }
    if (stored && stripNiqqud(stored) === current) {
      return stored;
    }
    return null;
  }

  async function toggleNikud() {
    if (nikud) {
      if (hasNiqqud(hebrew)) {
        vocalized.current.hebrew = hebrew;
      }
      if (hasNiqqud(hebrewExample)) {
        vocalized.current.example = hebrewExample;
      }
      setHebrew(stripNiqqud(hebrew));
      setHebrewExample(stripNiqqud(hebrewExample));
      setNikud(false);
      return;
    }

    const nextHebrew = restored(vocalized.current.hebrew, hebrew);
    const nextExample = restored(vocalized.current.example, hebrewExample);
    if (nextHebrew !== null && nextExample !== null) {
      vocalized.current = { hebrew: nextHebrew, example: nextExample };
      setHebrew(nextHebrew);
      setHebrewExample(nextExample);
      setNikud(true);
      return;
    }

    setPointing(true);
    setMessage(null);
    try {
      const response = await fetch("/api/cards/point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: [hebrew, hebrewExample] }),
      });
      if (response.status === 401) {
        setMessage("signed-out");
        return;
      }
      if (!response.ok) {
        setMessage("suggest");
        return;
      }
      const payload = (await response.json()) as { texts?: unknown };
      const texts = Array.isArray(payload.texts) ? payload.texts : [];
      const pointedWord = typeof texts[0] === "string" ? texts[0] : hebrew;
      const pointedExample = typeof texts[1] === "string" ? texts[1] : hebrewExample;
      vocalized.current = { hebrew: pointedWord, example: pointedExample };
      setHebrew(pointedWord);
      setHebrewExample(pointedExample);
      setNikud(true);
    } catch {
      setMessage("suggest");
    } finally {
      setPointing(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft: CardDraft = {
      english,
      partOfSpeech,
      example,
      hebrew,
      hebrewExample,
      gender: gender || null,
    };

    if (!draft.english.trim() || !draft.hebrew.trim()) {
      setMessage("required");
      return;
    }

    setSaving(true);
    setMessage(null);
    const result = await saveCard(deckId, card?.id ?? null, draft);
    setSaving(false);

    if (result === "ok") {
      onSaved(result);
      return;
    }

    setMessage(result === "signed-out" ? "signed-out" : "error");
    onSaved(result);
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="rounded-3xl border border-emerald-950/10 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(6,78,59,0.45)]"
    >
      <h2 className="text-lg font-semibold">{card ? t("editCard") : t("addCard")}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="card-english">{t("englishWord")}</Label>
          <Input
            id="card-english"
            value={english}
            maxLength={200}
            autoFocus
            onChange={(event) => setEnglish(event.target.value)}
            className={fieldClass}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="card-pos">{t("partOfSpeech")}</Label>
          <select
            id="card-pos"
            value={partOfSpeech}
            onChange={(event) => setPartOfSpeech(event.target.value as PartOfSpeech)}
            className="h-11 rounded-lg border border-emerald-900/10 bg-white px-3 text-sm text-emerald-950"
          >
            {partsOfSpeech.map((part) => (
              <option key={part} value={part}>
                {t(`pos.${part}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="card-example">
            {t("exampleSentence")} <span className="font-normal text-emerald-900/60">({t("optional")})</span>
          </Label>
          <textarea
            id="card-example"
            value={example}
            maxLength={400}
            onChange={(event) => setExample(event.target.value)}
            className="min-h-20 rounded-lg border border-emerald-900/10 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 border-emerald-900/10 bg-white text-emerald-950 hover:bg-emerald-50"
          disabled={suggesting || saving || pointing}
          onClick={() => void suggest()}
        >
          {suggesting ? t("suggesting") : t("suggestHebrew")}
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-pressed={nikud}
          aria-label={nikud ? t("hideNikud") : t("showNikud")}
          className={`h-10 rounded-full px-4 ${
            nikud
              ? "border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
              : "border-emerald-900/10 bg-emerald-950/5 text-emerald-900/45 hover:bg-emerald-50"
          }`}
          disabled={suggesting || saving || pointing}
          onClick={() => void toggleNikud()}
        >
          {pointing ? t("suggesting") : t("nikud")}
        </Button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="card-hebrew">{t("hebrewWord")}</Label>
          <Input
            id="card-hebrew"
            dir="rtl"
            lang="he"
            value={hebrew}
            maxLength={200}
            onChange={(event) => {
              setHebrew(event.target.value);
              remember("hebrew", event.target.value);
            }}
            className={fieldClass}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="card-gender">{t("genderLabel")}</Label>
          <select
            id="card-gender"
            value={gender}
            onChange={(event) => setGender(event.target.value as GrammaticalGender | "")}
            className="h-11 rounded-lg border border-emerald-900/10 bg-white px-3 text-sm text-emerald-950"
          >
            <option value="">{t("noGender")}</option>
            <option value="masculine">{t("masculine")}</option>
            <option value="feminine">{t("feminine")}</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="card-hebrew-example">
            {t("hebrewSentence")} <span className="font-normal text-emerald-900/60">({t("optional")})</span>
          </Label>
          <textarea
            id="card-hebrew-example"
            dir="rtl"
            lang="he"
            value={hebrewExample}
            maxLength={400}
            onChange={(event) => {
              setHebrewExample(event.target.value);
              remember("example", event.target.value);
            }}
            className="min-h-20 rounded-lg border border-emerald-900/10 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>
      {message === "required" ? (
        <p className="mt-3 text-sm text-red-800" role="alert">
          {t("cardFieldsRequired")}
        </p>
      ) : null}
      {message === "suggest" ? (
        <p className="mt-3 text-sm text-red-800" role="alert">
          {t("suggestError")}
        </p>
      ) : null}
      {message === "signed-out" ? (
        <p className="mt-3 text-sm text-emerald-900/70">{t("signInToEdit")}</p>
      ) : null}
      {message === "error" ? (
        <p className="mt-3 text-sm text-red-800" role="alert">
          {t("libraryError")}
        </p>
      ) : null}
      <div className="mt-4 flex gap-2">
        <Button
          type="submit"
          className="h-10 bg-emerald-800 px-4 text-white hover:bg-emerald-900"
          disabled={saving || suggesting}
        >
          {saving ? t("saving") : t("saveCard")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 border-emerald-900/10 bg-white text-emerald-950 hover:bg-emerald-50"
          onClick={onClose}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
