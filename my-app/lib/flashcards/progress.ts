const PREFIX = "webrew.mastery.";

function storageKey(deckId: string) {
  return `${PREFIX}${deckId}`;
}

export function readDeckMastery(deckId: string): Record<string, number> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(storageKey(deckId));
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const mastery: Record<string, number> = {};

    for (const [id, level] of Object.entries(parsed)) {
      if (
        typeof level === "number" &&
        Number.isInteger(level) &&
        level >= 0 &&
        level <= 6
      ) {
        mastery[id] = level;
      }
    }

    return mastery;
  } catch {
    return {};
  }
}

export function writeCardMastery(deckId: string, cardId: string, level: number) {
  const mastery = readDeckMastery(deckId);
  mastery[cardId] = level;
  window.localStorage.setItem(storageKey(deckId), JSON.stringify(mastery));
}

export function clearDeckMastery(deckId: string) {
  window.localStorage.removeItem(storageKey(deckId));
}
