// Copies words out of the Duolingo vocabulary bundle into lib/learn/words/catalog.json.
// Usage, from my-app: node scripts/pull-words.mjs אני שלום
// French and Spanish already stored on an entry are kept. A new entry copies English into both until edited.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = resolve(root, "lib/learn/words/catalog.json");
const bundlePath = resolve(root, "public/hebrew_duolingo_app_bundle/vocabulary.json");

const posMap = {
  Verb: "verb",
  Noun: "noun",
  Pronoun: "pronoun",
  Interrogative: "question",
  Interjection: "interjection",
  Phrase: "phrase",
  Adjective: "adjective",
  Adverb: "adverb",
  Preposition: "preposition",
  Conjunction: "conjunction",
  Particle: "particle",
};

function lettersOnly(value) {
  return [...(value ?? "")].filter((char) => char >= "א" && char <= "ת").join("");
}

function slug(value) {
  const ascii = (value ?? "")
    .normalize("NFKD")
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return ascii || "word";
}

const targets = new Set(process.argv.slice(2).map(lettersOnly).filter(Boolean));
if (targets.size === 0) {
  console.error("Pass one or more Hebrew words. Example: node scripts/pull-words.mjs אני שלום");
  process.exit(1);
}

const bundle = JSON.parse(readFileSync(bundlePath, "utf8"));
const found = new Map();
for (const entry of bundle.entries ?? []) {
  const key = lettersOnly(entry.hebrew);
  if (!targets.has(key) || found.has(key)) {
    continue;
  }
  const audio = entry.audio?.[0]?.path;
  if (!audio) {
    continue;
  }
  found.set(key, entry);
}

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const byHebrew = new Map(catalog.map((word) => [lettersOnly(word.hebrew), word]));
let added = 0;
let updated = 0;

for (const [key, entry] of found) {
  const english = entry.translations?.[0] ?? "";
  const genderName = entry.grammar?.gender;
  const gender = genderName === "Masculine" ? "masculine" : genderName === "Feminine" ? "feminine" : null;
  const partOfSpeech = posMap[entry.grammar?.part_of_speech] ?? "phrase";
  const existing = byHebrew.get(key);
  const next = {
    id: existing?.id ?? slug(entry.transliteration || key),
    hebrew: lettersOnly(entry.hebrew),
    niqqud: (entry.niqqud ?? entry.hebrew ?? "").replace(/\u200e/g, ""),
    transliteration: existing?.transliteration ?? (entry.transliteration ?? "").replace(/\u200e/g, ""),
    en: english || existing?.en || "",
    fr: existing?.fr ?? english,
    es: existing?.es ?? english,
    gender: existing?.gender ?? gender,
    partOfSpeech: existing?.partOfSpeech ?? partOfSpeech,
    audio: entry.audio[0].path,
  };
  if (existing) {
    Object.assign(existing, next, { fr: existing.fr, es: existing.es, id: existing.id });
    updated += 1;
  } else {
    catalog.push(next);
    added += 1;
  }
}

writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
const missing = [...targets].filter((key) => !found.has(key));
console.log(`Added ${added}, updated ${updated}.`);
if (missing.length > 0) {
  console.log(`No recording found for: ${missing.join(", ")}`);
}
