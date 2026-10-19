import type { GrammaticalGender } from "@/lib/flashcards/types";

const ENDPOINT = "https://nakdan-2-0.loadbalancer.dicta.org.il/api";

export type NakdanReading = {
  text: string;
  gender: GrammaticalGender | null;
};

function genderFromText(value: string): GrammaticalGender | null {
  const text = value.toLowerCase();
  if (text.includes("נקבה") || text.includes("feminine") || /\bfem\b/.test(text) || text === "f") {
    return "feminine";
  }
  if (text.includes("זכר") || text.includes("masculine") || /\bmasc\b/.test(text) || text === "m") {
    return "masculine";
  }
  return null;
}

// Nakdan's top reading stores morphology as a bitmask, not a label.
// Bit 21 is masculine and bit 22 is feminine. Both set means the reading is common gender.
function genderFromMorphCode(code: unknown): GrammaticalGender | null {
  if (typeof code === "string" && !/^\d+$/.test(code)) {
    return genderFromText(code);
  }

  const value = typeof code === "number" ? code : typeof code === "string" ? Number(code) : Number.NaN;
  if (!Number.isFinite(value) || value < 0 || !Number.isSafeInteger(value)) {
    return null;
  }

  const masculine = Math.floor(value / 2 ** 21) % 2 === 1;
  const feminine = Math.floor(value / 2 ** 22) % 2 === 1;
  if (masculine === feminine) {
    return null;
  }
  return masculine ? "masculine" : "feminine";
}

function genderFromTopReading(option: unknown): GrammaticalGender | null {
  if (!Array.isArray(option)) {
    return null;
  }
  const analyses = option[1];
  const first = Array.isArray(analyses) ? analyses[0] : null;
  if (!Array.isArray(first)) {
    return null;
  }
  return genderFromMorphCode(first[0]);
}

function optionWord(option: unknown) {
  if (typeof option === "string") {
    return option;
  }
  if (Array.isArray(option) && typeof option[0] === "string") {
    return option[0];
  }
  if (option && typeof option === "object") {
    const record = option as Record<string, unknown>;
    for (const key of ["word", "w", "text", "nakdan"]) {
      if (typeof record[key] === "string" && record[key]) {
        return record[key];
      }
    }
  }
  return "";
}

type RawToken = {
  word?: unknown;
  sep?: unknown;
  options?: unknown;
};

export function readNakdan(payload: unknown): NakdanReading {
  const tokens = Array.isArray(payload) ? payload : [];
  let text = "";
  let gender: GrammaticalGender | null = null;

  for (const token of tokens) {
    if (!token || typeof token !== "object") {
      continue;
    }
    const row = token as RawToken;
    if (row.sep === true) {
      text += typeof row.word === "string" ? row.word : "";
      continue;
    }
    const options = Array.isArray(row.options) ? row.options : [];
    const vocalized = optionWord(options[0]) || (typeof row.word === "string" ? row.word : "");
    text += vocalized;
    // Only the preferred reading. A later option can be a different word with a different gender.
    gender ??= genderFromTopReading(options[0]);
  }

  return { text: text.trim(), gender };
}

export async function pointHebrew(text: string): Promise<NakdanReading> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      task: "nakdan",
      genre: "modern",
      data: text,
      addmorph: true,
      keepqq: false,
    }),
  });

  if (!response.ok) {
    throw new Error("Nakdan failed");
  }

  return readNakdan(await response.json());
}
