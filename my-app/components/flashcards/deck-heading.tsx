"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { deleteDeck, updateDeck } from "@/lib/flashcards/library";

export function DeckHeading({
  deckId,
  title,
  description,
  canDelete,
  level,
  opensDeck = false,
  titleClassName,
  descriptionClassName,
}: {
  deckId: string;
  title: string;
  description: string;
  canDelete: boolean;
  level: "h1" | "h2";
  opensDeck?: boolean;
  titleClassName: string;
  descriptionClassName: string;
}) {
  const t = useTranslations("Flashcards");
  const router = useRouter();
  const Title = level;
  const openTimer = useRef<number | null>(null);
  const cancelEdit = useRef(false);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const [field, setField] = useState<"title" | "description" | null>(null);
  const [draft, setDraft] = useState("");
  const [armed, setArmed] = useState(false);
  const [message, setMessage] = useState<"signed-out" | "error" | null>(null);

  useEffect(() => {
    return () => {
      if (openTimer.current) {
        window.clearTimeout(openTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!armed) {
      return;
    }

    function away(event: PointerEvent) {
      if (!deleteRef.current?.contains(event.target as Node)) {
        setArmed(false);
      }
    }

    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [armed]);

  function scheduleOpen() {
    if (!opensDeck) {
      return;
    }
    if (openTimer.current) {
      window.clearTimeout(openTimer.current);
    }
    openTimer.current = window.setTimeout(() => {
      router.push(`/?deck=${deckId}`);
    }, 220);
  }

  function beginEdit(next: "title" | "description") {
    if (openTimer.current) {
      window.clearTimeout(openTimer.current);
    }
    setDraft(next === "title" ? title : description);
    setField(next);
    setMessage(null);
  }

  async function commit() {
    const editing = field;
    const value = draft;
    setField(null);
    if (!editing) {
      return;
    }

    const nextTitle = editing === "title" ? value : title;
    const nextDescription = editing === "description" ? value : description;
    if (!nextTitle.trim() || (nextTitle.trim() === title.trim() && nextDescription.trim() === description.trim())) {
      return;
    }

    const result = await updateDeck(deckId, nextTitle, nextDescription);
    if (result === "ok") {
      router.refresh();
      return;
    }
    setMessage(result === "signed-out" ? "signed-out" : "error");
  }

  async function remove() {
    const result = await deleteDeck(deckId);
    if (result === "ok") {
      router.push("/");
      router.refresh();
      return;
    }
    setArmed(false);
    setMessage(result === "signed-out" ? "signed-out" : "error");
  }

  return (
    <div>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          {field === "title" ? (
            <input
              value={draft}
              maxLength={80}
              autoFocus
              aria-label={t("deckTitle")}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => {
                if (cancelEdit.current) {
                  cancelEdit.current = false;
                  return;
                }
                void commit();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }
                if (event.key === "Escape") {
                  cancelEdit.current = true;
                  setField(null);
                }
              }}
              className="h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-xl font-semibold"
            />
          ) : (
            <Title
              className={titleClassName}
              title={t("renameHint")}
              onClick={scheduleOpen}
              onDoubleClick={() => beginEdit("title")}
            >
              {title}
            </Title>
          )}
          {field === "description" ? (
            <textarea
              value={draft}
              maxLength={400}
              autoFocus
              aria-label={t("deckDescription")}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => {
                if (cancelEdit.current) {
                  cancelEdit.current = false;
                  return;
                }
                void commit();
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  cancelEdit.current = true;
                  setField(null);
                }
              }}
              className="mt-2 min-h-16 w-full rounded-lg border border-emerald-900/10 bg-white px-3 py-2 text-sm"
            />
          ) : (
            <p
              className={`${descriptionClassName}${description ? "" : " opacity-40"}`}
              title={t("renameHint")}
              onClick={scheduleOpen}
              onDoubleClick={() => beginEdit("description")}
            >
              {description || t("deckDescription")}
            </p>
          )}
        </div>
        {canDelete ? (
          <Button
            ref={deleteRef}
            type="button"
            variant="ghost"
            size="icon"
            className={`shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700 ${armed ? "bg-red-50 ring-2 ring-red-200" : ""}`}
            aria-label={armed ? t("deleteDeckConfirm") : t("deleteDeck")}
            onClick={(event) => {
              event.stopPropagation();
              if (!armed) {
                setArmed(true);
                return;
              }
              void remove();
            }}
          >
            <Trash2 />
          </Button>
        ) : null}
      </div>
      {message === "signed-out" ? <p className="mt-2 text-sm text-emerald-900/70">{t("signInToEdit")}</p> : null}
      {message === "error" ? (
        <p className="mt-2 text-sm text-red-800" role="alert">
          {t("libraryError")}
        </p>
      ) : null}
    </div>
  );
}
