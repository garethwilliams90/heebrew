import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import * as zlib from "node:zlib";
import { ANKI_NOTE_LIMIT, readAnkiNote, type AnkiField, type AnkiIssue } from "./anki-note";
const COLLECTION_NAMES = ["collection.anki21", "collection.anki2", "collection.anki21b"];

export type AnkiCardPreview = {
  id: string;
  fields: AnkiField[];
  english: string;
  hebrew: string;
  example: string;
  hebrewExample: string;
  audioFile: string | null;
  exampleAudioFile: string | null;
  issue: AnkiIssue | null;
};

export type AnkiDeckPreview = {
  id: string;
  name: string;
  cards: AnkiCardPreview[];
};

export class AnkiPackageError extends Error {
  readonly code: "unreadable" | "empty" | "too-many";

  constructor(code: "unreadable" | "empty" | "too-many") {
    super(code);
    this.code = code;
  }
}

type ZipEntry = {
  name: string;
  method: number;
  compressedSize: number;
  localOffset: number;
};

/** Reads an .apkg collection and keeps one card per note. */
export function readApkg(bytes: Buffer): { decks: AnkiDeckPreview[] } {
  const entries = readZipEntries(bytes);
  const collections = COLLECTION_NAMES.flatMap((name) => {
    const entry = entries.find((item) => item.name === name);
    if (!entry) {
      return [];
    }

    const sqlite = sqliteBytes(name, inflateEntry(bytes, entry));
    return sqlite ? [{ name, sqlite }] : [];
  });

  if (collections.length === 0) {
    throw new AnkiPackageError("unreadable");
  }

  let best: RawNote[] = [];
  let bestNames = new Map<string, string>();
  let readable = false;

  for (const collection of collections) {
    let parsed: { notes: RawNote[]; deckNames: Map<string, string> };
    try {
      parsed = readCollection(collection.sqlite);
    } catch {
      continue;
    }

    readable = true;

    if (parsed.notes.length > best.length) {
      best = parsed.notes;
      bestNames = parsed.deckNames;
    }
  }

  if (!readable) {
    throw new AnkiPackageError("unreadable");
  }

  if (best.length === 0) {
    throw new AnkiPackageError("empty");
  }

  if (best.length > ANKI_NOTE_LIMIT) {
    throw new AnkiPackageError("too-many");
  }

  const grouped = new Map<string, AnkiCardPreview[]>();

  for (const note of best) {
    const deckName = bestNames.get(note.deckId) ?? "Imported";
    const top = deckName.split("::")[0] || deckName;
    const read = readAnkiNote(note.fields);
    const cards = grouped.get(top) ?? [];
    cards.push({
      id: note.id,
      fields: read.fields,
      english: read.english,
      hebrew: read.hebrew,
      example: read.example,
      hebrewExample: read.hebrewExample,
      audioFile: read.audioFile,
      exampleAudioFile: read.exampleAudioFile,
      issue: read.issue,
    });
    grouped.set(top, cards);
  }

  const decks = [...grouped.entries()].map(([name, cards]) => ({
    id: name,
    name,
    cards,
  }));

  if (decks.length === 0) {
    throw new AnkiPackageError("empty");
  }

  return { decks };
}

/** Inflates only the recordings referenced by the notes being imported. */
export function readApkgSounds(bytes: Buffer, names: string[]) {
  const wanted = new Set(names.filter((name) => name.length > 0));
  const found = new Map<string, Buffer>();
  if (wanted.size === 0) {
    return found;
  }

  const entries = readZipEntries(bytes);
  const media = entries.find((entry) => entry.name === "media");
  if (!media) {
    return found;
  }

  let listing: unknown;
  try {
    listing = JSON.parse(inflateEntry(bytes, media).toString("utf8"));
  } catch {
    return found;
  }

  if (!listing || typeof listing !== "object" || Array.isArray(listing)) {
    return found;
  }

  for (const [entryName, fileName] of Object.entries(listing)) {
    if (typeof fileName !== "string" || !wanted.has(fileName) || found.has(fileName)) {
      continue;
    }

    const entry = entries.find((item) => item.name === entryName);
    if (!entry) {
      continue;
    }

    try {
      found.set(fileName, inflateEntry(bytes, entry));
    } catch {
      continue;
    }
  }

  return found;
}

type RawNote = {
  id: string;
  deckId: string;
  fields: AnkiField[];
};

function readCollection(bytes: Buffer) {
  const dir = mkdtempSync(join(tmpdir(), "webrew-anki-"));

  try {
    const path = join(dir, "collection.sqlite");
    writeFileSync(path, bytes);
    const database = new DatabaseSync(path, { readOnly: true });

    try {
      return {
        notes: readNotes(database),
        deckNames: readDeckNames(database),
      };
    } finally {
      database.close();
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function readNotes(database: DatabaseSync): RawNote[] {
  const tables = tableNames(database);
  if (!tables.has("notes")) {
    throw new AnkiPackageError("unreadable");
  }

  const fieldNames = readFieldNames(database, tables);
  const cardColumns = tables.has("cards") ? columnNames(database, "cards") : new Set<string>();
  const order = cardColumns.has("ord") ? "c.ord" : "c.id";
  const rows = cardColumns.has("did")
    ? database
        .prepare(
          `select n.id as id, n.mid as mid, n.flds as flds, c.did as did
           from notes n
           join cards c on c.nid = n.id
           order by n.id, ${order}`,
        )
        .all()
    : database.prepare("select id, mid, flds, null as did from notes order by id").all();

  const seen = new Set<string>();
  const notes: RawNote[] = [];

  for (const row of rows) {
    const record = row as Record<string, unknown>;
    const id = textValue(record.id);
    if (!id || seen.has(id)) {
      continue;
    }

    seen.add(id);
    const parts = String(record.flds ?? "").split("\u001f");
    const names = fieldNames.get(textValue(record.mid)) ?? [];
    notes.push({
      id,
      deckId: textValue(record.did),
      fields: parts.map((text, index) => ({
        name: names[index] || `Field ${index + 1}`,
        text,
      })),
    });
  }

  return notes;
}

function readFieldNames(database: DatabaseSync, tables: Set<string>) {
  const names = new Map<string, string[]>();

  if (tables.has("fields")) {
    const rows = database.prepare("select ntid, ord, name from fields order by ntid, ord").all();
    for (const row of rows) {
      const record = row as Record<string, unknown>;
      const id = textValue(record.ntid);
      const list = names.get(id) ?? [];
      list.push(typeof record.name === "string" ? record.name : "");
      names.set(id, list);
    }

    return names;
  }

  if (!tables.has("col")) {
    return names;
  }

  const column = columnNames(database, "col");
  if (!column.has("models")) {
    return names;
  }

  const row = database.prepare("select models from col limit 1").get() as { models?: unknown } | undefined;
  if (typeof row?.models !== "string" || !row.models) {
    return names;
  }

  const models = parseJson(row.models);
  if (!models) {
    return names;
  }

  for (const [id, model] of Object.entries(models)) {
    const fields = Array.isArray(model?.flds) ? model.flds : [];
    names.set(
      id,
      fields.map((field, index) => (typeof field?.name === "string" ? field.name : `Field ${index + 1}`)),
    );
  }

  return names;
}

function readDeckNames(database: DatabaseSync) {
  const names = new Map<string, string>();
  const tables = tableNames(database);

  if (tables.has("decks") && columnNames(database, "decks").has("name")) {
    for (const row of database.prepare("select id, name from decks").all()) {
      const record = row as Record<string, unknown>;
      if (typeof record.name === "string") {
        names.set(textValue(record.id), record.name);
      }
    }

    return names;
  }

  if (!tables.has("col") || !columnNames(database, "col").has("decks")) {
    return names;
  }

  const row = database.prepare("select decks from col limit 1").get() as { decks?: unknown } | undefined;
  const decks = typeof row?.decks === "string" ? parseJson(row.decks) : null;
  if (!decks) {
    return names;
  }

  for (const [id, deck] of Object.entries(decks)) {
    if (typeof deck?.name === "string") {
      names.set(id, deck.name);
    }
  }

  return names;
}

function tableNames(database: DatabaseSync) {
  const rows = database.prepare("select name from sqlite_master where type = 'table'").all();
  return new Set(rows.map((row: unknown) => String((row as { name?: unknown }).name ?? "")));
}

function columnNames(database: DatabaseSync, table: "cards" | "col" | "decks" | "fields") {
  const rows = database.prepare(`pragma table_info(${table})`).all();
  return new Set(rows.map((row: unknown) => String((row as { name?: unknown }).name ?? "")));
}

function parseJson(value: string): Record<string, { name?: unknown; flds?: { name?: unknown }[] }> | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as Record<string, { name?: unknown; flds?: { name?: unknown }[] }>;
  } catch {
    return null;
  }
}

function textValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }

  return "";
}

function sqliteBytes(name: string, bytes: Buffer) {
  const decoded = name.endsWith(".anki21b") ? decompressZstd(bytes) : bytes;
  if (!decoded || decoded.subarray(0, 15).toString() !== "SQLite format 3") {
    return null;
  }

  return decoded;
}

function decompressZstd(bytes: Buffer) {
  // Node 25 can decompress Anki's zstd collection. The installed Node types predate that export.
  const decompress = (zlib as { zstdDecompressSync?: (value: Buffer) => Buffer }).zstdDecompressSync;
  if (!decompress) {
    return null;
  }

  try {
    return decompress(bytes);
  } catch {
    return null;
  }
}

function readZipEntries(bytes: Buffer): ZipEntry[] {
  if (bytes.length < 22 || bytes.readUInt32LE(0) !== 0x04034b50) {
    throw new AnkiPackageError("unreadable");
  }

  const eocd = findEocd(bytes);
  const count = bytes.readUInt16LE(eocd + 10);
  let offset = bytes.readUInt32LE(eocd + 16);
  const entries: ZipEntry[] = [];
  const zip64 = count === 0xffff || offset === 0xffffffff ? readZip64Locator(bytes, eocd) : null;
  const total = zip64 ? zip64.count : count;
  if (zip64) {
    offset = zip64.offset;
  }

  for (let index = 0; index < total; index += 1) {
    if (offset + 46 > bytes.length || bytes.readUInt32LE(offset) !== 0x02014b50) {
      throw new AnkiPackageError("unreadable");
    }

    const method = bytes.readUInt16LE(offset + 10);
    let compressedSize = bytes.readUInt32LE(offset + 20);
    let localOffset = bytes.readUInt32LE(offset + 42);
    const uncompressedSize = bytes.readUInt32LE(offset + 24);
    const nameLength = bytes.readUInt16LE(offset + 28);
    const extraLength = bytes.readUInt16LE(offset + 30);
    const commentLength = bytes.readUInt16LE(offset + 32);
    const name = bytes.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    const extra = bytes.subarray(offset + 46 + nameLength, offset + 46 + nameLength + extraLength);

    if (compressedSize === 0xffffffff || localOffset === 0xffffffff || uncompressedSize === 0xffffffff) {
      const zip64 = readZip64Extra(extra, {
        size: uncompressedSize === 0xffffffff,
        compressed: compressedSize === 0xffffffff,
        offset: localOffset === 0xffffffff,
      });
      compressedSize = zip64.compressedSize ?? compressedSize;
      localOffset = zip64.localOffset ?? localOffset;
    }

    entries.push({ name, method, compressedSize, localOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function inflateEntry(bytes: Buffer, entry: ZipEntry) {
  if (entry.localOffset + 30 > bytes.length || bytes.readUInt32LE(entry.localOffset) !== 0x04034b50) {
    throw new AnkiPackageError("unreadable");
  }

  const nameLength = bytes.readUInt16LE(entry.localOffset + 26);
  const extraLength = bytes.readUInt16LE(entry.localOffset + 28);
  const start = entry.localOffset + 30 + nameLength + extraLength;
  const compressed = bytes.subarray(start, start + entry.compressedSize);

  if (entry.method === 0) {
    return Buffer.from(compressed);
  }

  if (entry.method === 8) {
    try {
      return zlib.inflateRawSync(compressed);
    } catch {
      throw new AnkiPackageError("unreadable");
    }
  }

  throw new AnkiPackageError("unreadable");
}

function findEocd(bytes: Buffer) {
  const start = Math.max(0, bytes.length - 22 - 0xffff);
  for (let offset = bytes.length - 22; offset >= start; offset -= 1) {
    if (bytes.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }

  throw new AnkiPackageError("unreadable");
}

function readZip64Locator(bytes: Buffer, eocd: number) {
  const locator = eocd - 20;
  if (locator < 0 || bytes.readUInt32LE(locator) !== 0x07064b50) {
    throw new AnkiPackageError("unreadable");
  }

  const header = Number(bytes.readBigUInt64LE(locator + 8));
  if (header + 56 > bytes.length || bytes.readUInt32LE(header) !== 0x06064b50) {
    throw new AnkiPackageError("unreadable");
  }

  return {
    count: Number(bytes.readBigUInt64LE(header + 32)),
    offset: Number(bytes.readBigUInt64LE(header + 48)),
  };
}

function readZip64Extra(
  extra: Buffer,
  flags: { size: boolean; compressed: boolean; offset: boolean },
) {
  let offset = 0;
  let compressedSize: number | undefined;
  let localOffset: number | undefined;

  while (offset + 4 <= extra.length) {
    const id = extra.readUInt16LE(offset);
    const size = extra.readUInt16LE(offset + 2);
    const start = offset + 4;
    if (id === 1) {
      let cursor = start;
      if (flags.size) {
        cursor += 8;
      }
      if (flags.compressed && cursor + 8 <= start + size) {
        compressedSize = Number(extra.readBigUInt64LE(cursor));
        cursor += 8;
      }
      if (flags.offset && cursor + 8 <= start + size) {
        localOffset = Number(extra.readBigUInt64LE(cursor));
      }
    }

    offset = start + size;
  }

  return { compressedSize, localOffset };
}
