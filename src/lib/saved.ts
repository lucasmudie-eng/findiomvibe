export type SavedItem = {
  id: string;
  title: string;
  href: string;
  image?: string | null;
  meta?: string | null;
  savedAt: string;
};

export function readSaved(key: string): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedItem[]) : [];
  } catch {
    return [];
  }
}

export function writeSaved(key: string, items: SavedItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function isSaved(key: string, id: string) {
  return readSaved(key).some((item) => item.id === id);
}

export function toggleSaved(key: string, item: SavedItem) {
  const items = readSaved(key);
  const exists = items.some((saved) => saved.id === item.id);
  const next = exists
    ? items.filter((saved) => saved.id !== item.id)
    : [item, ...items].slice(0, 200);
  writeSaved(key, next);
  return !exists;
}
