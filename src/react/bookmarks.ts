const KEY = "remotion_bookmarks";

export const loadBookmarks = (): string[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
};

export const saveBookmarks = (ids: readonly string[]): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage full or blocked: the app keeps working, only persistence is lost
  }
};

// Immutable update: the parameter is readonly, so ids.push(...) is a compile error.
// The result is ALWAYS a new array. The old array is never touched.
export const toggleBookmark = (ids: readonly string[], id: string): string[] =>
  ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
