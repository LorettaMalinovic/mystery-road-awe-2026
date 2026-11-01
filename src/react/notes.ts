const KEY = "remotion_notes";

export type NotesStore = Readonly<Record<string, string>>;

export const loadNotes = (): NotesStore => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const result: Record<string, string> = {};
    for (const [id, text] of Object.entries(parsed)) {
      if (typeof text === "string") result[id] = text;
    }
    return result;
  } catch {
    return {};
  }
};

export const saveNotes = (notes: NotesStore): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(notes));
  } catch {
    // ignore: see saveBookmarks
  }
};

// Immutable update: returns a new object. An empty text removes the note.
export const withNote = (notes: NotesStore, id: string, text: string): NotesStore => {
  const trimmed = text.trim();
  if (trimmed === "") {
    return Object.fromEntries(Object.entries(notes).filter(([key]) => key !== id));
  }
  return { ...notes, [id]: trimmed };
};
