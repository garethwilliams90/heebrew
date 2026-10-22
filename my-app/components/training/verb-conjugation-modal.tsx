"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VerbRecord } from "@/lib/training/verb-conjugations";

export function VerbConjugationModal({
  verb,
  onClose,
}: {
  verb: VerbRecord;
  onClose: () => void;
}) {
  const [tense, setTense] = useState<"past" | "present" | "future">("present");

  const filteredForms = verb.forms.filter((f) => f.tense === tense);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-emerald-900 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-emerald-950">
              <span dir="rtl" lang="he">{verb.infinitive}</span>
            </h2>
            <p className="mt-1 text-sm text-emerald-900/70">
              {verb.english} • {verb.binyan} • Root: <span dir="rtl" lang="he">{verb.root}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-emerald-900 hover:bg-emerald-100"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="mb-4 flex gap-2">
          <Button
            variant={tense === "past" ? "default" : "outline"}
            className={
              tense === "past"
                ? "bg-emerald-800 text-white hover:bg-emerald-900"
                : "border-emerald-300 text-emerald-900 hover:bg-emerald-50"
            }
            onClick={() => setTense("past")}
          >
            Past
          </Button>
          <Button
            variant={tense === "present" ? "default" : "outline"}
            className={
              tense === "present"
                ? "bg-emerald-800 text-white hover:bg-emerald-900"
                : "border-emerald-300 text-emerald-900 hover:bg-emerald-50"
            }
            onClick={() => setTense("present")}
          >
            Present
          </Button>
          <Button
            variant={tense === "future" ? "default" : "outline"}
            className={
              tense === "future"
                ? "bg-emerald-800 text-white hover:bg-emerald-900"
                : "border-emerald-300 text-emerald-900 hover:bg-emerald-50"
            }
            onClick={() => setTense("future")}
          >
            Future
          </Button>
        </div>

        <div className="space-y-2">
          {filteredForms.map((form, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/30 px-4 py-2"
            >
              <div className="flex items-center gap-4">
                <span className="min-w-24 text-sm text-emerald-900/70">
                  {form.person} {form.number}
                  {form.gender !== "common" ? ` (${form.gender.slice(0, 1)})` : ""}
                </span>
                <span dir="rtl" lang="he" className="text-lg font-medium text-emerald-950">
                  {form.hebrew}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
