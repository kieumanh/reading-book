export const MAX_READING_LEVEL = 111;

const vietnameseNumber = new Intl.NumberFormat("vi-VN");

export function xpAtLevel(level) {
  return level === 0 ? 0n : 1n << BigInt(level - 1);
}

export function levelAtXp(xp) {
  if (xp <= 0n) return 0;
  return Math.min(xp.toString(2).length, MAX_READING_LEVEL);
}

export function journeyProgress(record) {
  const chapters = BigInt(record?.chapters ?? 0);
  const books = BigInt(record?.books ?? 0);
  const xp = chapters + books;
  const level = levelAtXp(xp);
  const seen = Math.min(level, Math.max(0, Number(record?.seen) || 0));
  const next = level === MAX_READING_LEVEL ? null : xpAtLevel(level + 1);
  const interval = next === null ? 0n : next - xpAtLevel(level);
  const percent = next === null ? 100 : Number((xp - xpAtLevel(level)) * 100n / interval);
  return { chapters, books, xp, level, seen, next, percent };
}

export function formatXp(value) {
  return vietnameseNumber.format(value);
}

export function bookCredit(item) {
  if (item?.type !== "book") return { chapters: 0, books: 0 };
  const chapters = Number.isSafeInteger(item.done) ? Math.max(0, item.done) : 0;
  return { chapters, books: Number(item.total > 0 && chapters >= item.total) };
}
