"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/flashcards/form-dialog";
import { useRouter } from "@/i18n/navigation";
import { createDeck } from "@/lib/flashcards/library";

export function NewDeckForm() {
  const t = useTranslations("Flashcards");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"required" | "signed-out" | "error" | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setMessage("required");
      return;
    }

    setSaving(true);
    setMessage(null);
    const result = await createDeck(title, description);
    setSaving(false);

    if (typeof result === "object") {
      router.push(`/decks?deck=${result.id}&view=cards`);
      router.refresh();
      return;
    }

    setMessage(result === "signed-out" ? "signed-out" : "error");
  }

  function close() {
    setOpen(false);
    setTitle("");
    setDescription("");
    setMessage(null);
  }

  return (
    <>
      <Button type="button" size="lg" onClick={() => setOpen(true)}>
        {t("newDeck")}
      </Button>
      {open ? (
        <FormDialog label={t("newDeck")} onClose={close}>
          <form
            onSubmit={(event) => void submit(event)}
            className="w-full rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(6,78,59,0.45)]"
          >
            <h2 className="text-xl font-semibold">{t("newDeck")}</h2>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="deck-title">{t("deckTitle")}</Label>
                <Input
                  id="deck-title"
                  value={title}
                  maxLength={80}
                  autoFocus
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-11 border-emerald-900/10 bg-white"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="deck-description">
                  {t("deckDescription")}{" "}
                  <span className="font-normal text-emerald-900/60">({t("optional")})</span>
                </Label>
                <textarea
                  id="deck-description"
                  value={description}
                  maxLength={400}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-20 rounded-lg border border-emerald-900/10 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            {message === "required" ? (
              <p className="mt-3 text-sm text-red-800" role="alert">
                {t("deckTitleRequired")}
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
              <Button type="submit" size="lg" disabled={saving}>
                {saving ? t("saving") : t("createDeck")}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={close}>
                {t("cancel")}
              </Button>
            </div>
          </form>
        </FormDialog>
      ) : null}
    </>
  );
}
