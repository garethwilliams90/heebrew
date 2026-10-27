export function slugFromTitle(title: string) {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "post";
}

export function uniqueSlug(base: string, taken: ReadonlySet<string>) {
  const root = base.slice(0, 80) || "post";
  if (!taken.has(root)) {
    return root;
  }
  for (let index = 2; index < 1000; index += 1) {
    const suffix = `-${index}`;
    const next = `${root.slice(0, 96 - suffix.length)}${suffix}`;
    if (!taken.has(next)) {
      return next;
    }
  }
  return `${root.slice(0, 87)}-${indexTail()}`;
}

function indexTail() {
  return Math.random().toString(36).slice(2, 10);
}
