export const readBookmarkIds = (): string[] => {
  try {
    const raw = localStorage.getItem("remotion_bookmarks");
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
};