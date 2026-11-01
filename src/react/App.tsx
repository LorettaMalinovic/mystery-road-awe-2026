import { useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { DashboardPage } from "./pages/DashboardPage";
import { EvidencePage } from "./pages/EvidencePage";
import { PeoplePage } from "./pages/PeoplePage";
import { TimelinePage } from "./pages/TimelinePage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { useHashView } from "./useHashView";
import { useCaseData, type LoadState } from "./useCaseData";
import { loadBookmarks, saveBookmarks, toggleBookmark } from "./bookmarks";
import { loadNotes, saveNotes, withNote, type NotesStore } from "./notes";
import type { ViewId } from "./routes";

interface SharedState {
  bookmarkedIds: readonly string[];
  notes: NotesStore;
  onToggleBookmark: (id: string) => void;
  onSaveNote: (id: string, text: string) => void;
}

const renderPage = (view: ViewId, loaded: LoadState, shared: SharedState) => {
  if (loaded.status === "loading") return <p>Loading case file...</p>;
  if (loaded.status === "error") return <p>Could not load the case: {loaded.message}</p>;
  const data = loaded.data;

  switch (view) {
    case "dashboard":
      return <DashboardPage data={data} bookmarkedIds={shared.bookmarkedIds} />;
    case "evidence":
      return (
        <EvidencePage
          data={data}
          bookmarkedIds={shared.bookmarkedIds}
          notes={shared.notes}
          onToggleBookmark={shared.onToggleBookmark}
          onSaveNote={shared.onSaveNote}
        />
      );
    case "people":
      return <PeoplePage data={data} />;
    case "timeline":
      return <TimelinePage data={data} />;
    case "workspace":
      return (
        <WorkspacePage
          data={data}
          bookmarkedIds={shared.bookmarkedIds}
          notes={shared.notes}
          onToggleBookmark={shared.onToggleBookmark}
        />
      );
  }
};

export const App = () => {
  const currentView = useHashView();
  const loaded = useCaseData();

  // Demo 5: the ONE owner of bookmark and note state. App is the lowest common ancestor of
  // Dashboard (reads), Evidence (reads + changes) and Workspace (reads + changes).
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(loadBookmarks);
  const [notes, setNotes] = useState<NotesStore>(loadNotes);

  // Demo 6: these functions go DOWN as props. Children can only ask, App does the change.
  const handleToggleBookmark = (id: string) => {
    const next = toggleBookmark(bookmarkedIds, id); // new array
    setBookmarkedIds(next);
    saveBookmarks(next);
  };

  const handleSaveNote = (id: string, text: string) => {
    const next = withNote(notes, id, text); // new object
    setNotes(next);
    saveNotes(next);
  };

  const shared: SharedState = {
    bookmarkedIds,
    notes,
    onToggleBookmark: handleToggleBookmark,
    onSaveNote: handleSaveNote,
  };

  return (
    <>
      <Header currentView={currentView} />
      <main className="app-main">{renderPage(currentView, loaded, shared)}</main>
      <Footer />
    </>
  );
};
