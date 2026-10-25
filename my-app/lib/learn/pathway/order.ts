export function seededOrder<T>(items: readonly T[], seedText: string): T[] {
  const next = [...items];
  let state = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    state = Math.imul(state ^ seedText.charCodeAt(index), 16777619);
  }

  for (let index = next.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = state % (index + 1);
    const current = next[index];
    next[index] = next[swap] as T;
    next[swap] = current as T;
  }

  return next;
}
