const units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const hundreds = ["", "ק", "ר", "ש", "ת", "תק", "תר", "תש", "תת", "תתק"];

/** Hebrew number letters. 15 is טו and 16 is טז so the count never spells a divine name. */
export function gematria(value: number) {
  const count = Math.trunc(value);
  if (count <= 0 || count > 999) {
    return String(value);
  }
  const hundred = Math.floor(count / 100);
  const rest = count % 100;
  const tail = rest === 15 ? "טו" : rest === 16 ? "טז" : `${tens[Math.floor(rest / 10)] ?? ""}${units[rest % 10] ?? ""}`;
  return `${hundreds[hundred] ?? ""}${tail}`;
}
