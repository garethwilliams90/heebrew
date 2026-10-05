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

function genderFromValue(value: unknown, depth = 0): GrammaticalGender | null {
  if (depth > 5 || value == null) {
    return null;
  }
  if (typeof value === "string") {
    return genderFromText(value);
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = genderFromValue(item, depth + 1);
      if (found) {
        return found;
      }
    }
    return null;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["gender", "Gender", "gen", "morph", "feats", "morphology"]) {
      if (key in record) {
        const found = genderFromValue(record[key], depth + 1);
        if (found) {
          return found;
        }
      }
    }
  }
  return null;
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
    if (!gender) {
      for (const option of options) {
        gender = genderFromValue(option);
        if (gender) {
          break;
        }
      }
      gender ??= genderFromValue(row);
    }
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
