import { createContext, useContext, useState, type ReactNode } from "react";
import { loadBookmarks, saveBookmarks, toggleBookmark } from "./bookmarks";

interface BookmarksValue {
  bookmarkedIds: readonly string[];
  onToggleBookmark: (id: string) => void;
}

const BookmarksContext = createContext<BookmarksValue | null>(null);

// The provider now owns the bookmark state (it moved here from App).
export const BookmarksProvider = ({ children }: { children: ReactNode }) => {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(loadBookmarks);

  const onToggleBookmark = (id: string) => {
    const next = toggleBookmark(bookmarkedIds, id);
    setBookmarkedIds(next);
    saveBookmarks(next);
  };

  return (
    <BookmarksContext.Provider value={{ bookmarkedIds, onToggleBookmark }}>
      {children}
    </BookmarksContext.Provider>
  );
};

export const useBookmarks = (): BookmarksValue => {
  const value = useContext(BookmarksContext);
  if (value === null) {
    throw new Error("useBookmarks must be used inside <BookmarksProvider>");
  }
  return value;
};
