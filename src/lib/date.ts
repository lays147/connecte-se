// Event dates are stored as Brazilian "DD/MM/YYYY" strings, which don't sort
// lexicographically — always compare via parseEventDate/eventDateKey, never
// with raw string comparison.

export function parseEventDate(date: string): Date {
  const [day, month, year] = date.split("/").map(Number);
  return new Date(year, month - 1, day);
}

// Zero-padded YYYYMMDD, safe for lexicographic sort/comparison.
export function eventDateKey(date: string): string {
  const [day, month, year] = date.split("/");
  return `${year}${month}${day}`;
}

export function isValidEventDate(date: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return false;
  const [day, month, year] = date.split("/").map(Number);
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}
