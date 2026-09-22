import {
  STORAGE_KEY_BOOKMARKS,
  STORAGE_KEY_HYPOTHESIS,
  STORAGE_KEY_NOTES,
  state
} from "./state.js";

export const saveBookmarksToStorage = () => {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(state.bookmarks));
};

export const loadBookmarksFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    const parsed = raw ? JSON.parse(raw) : [];
    state.bookmarks = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    state.bookmarks = [];
  }
};

export const saveNoteForEvidence = (evidenceId, text) => {
  state.notesStore[evidenceId] = text;
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(state.notesStore));
};

export const loadNoteForEvidence = (evidenceId) => state.notesStore[evidenceId] || "";

export const loadNotesFromStorage = () => {
  const raw = localStorage.getItem(STORAGE_KEY_NOTES);
  if (!raw) {
    state.notesStore = {};
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.notesStore = parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.warn("Could not read stored notes, starting empty", err);
    state.notesStore = {};
  }
};

export const loadNoteAsync = async (evidenceId) => state.notesStore[evidenceId] || "";

export const saveHypothesisDraft = (draft) => {
  localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
};

export const readHypothesisDraft = () => {
  const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read stored hypothesis draft", err);
    return null;
  }
};
