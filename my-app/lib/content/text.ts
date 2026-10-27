const TITLE_MAX = 160;
const BODY_MAX = 20000;

export function cleanRequired(value: FormDataEntryValue | null, max = BODY_MAX) {
  if (typeof value !== "string") {
    return null;
  }
  const text = value.trim();
  if (!text || text.length > max || text.includes("\0")) {
    return null;
  }
  return text;
}

export function cleanOptional(value: FormDataEntryValue | null, max = BODY_MAX) {
  if (typeof value !== "string") {
    return "";
  }
  const text = value.trim();
  if (text.length > max || text.includes("\0")) {
    return null;
  }
  return text;
}

export function cleanTitle(value: FormDataEntryValue | null, max = TITLE_MAX) {
  return cleanRequired(value, max);
}
