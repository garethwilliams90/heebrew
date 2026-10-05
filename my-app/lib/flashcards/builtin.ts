export const builtinDeckIds = ["nature", "hebrew-from-scratch"] as const;

export type BuiltinDeckId = (typeof builtinDeckIds)[number];

export function isBuiltinDeck(id: string): id is BuiltinDeckId {
  return (builtinDeckIds as readonly string[]).includes(id);
}

const USER_CARD_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUserCardId(id: string) {
  return USER_CARD_ID.test(id);
}
