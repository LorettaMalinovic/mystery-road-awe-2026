import { useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { DashboardPage } from "./pages/DashboardPage";
import { EvidencePage } from "./pages/EvidencePage";
import { PeoplePage } from "./pages/PeoplePage";
import { TimelinePage } from "./pages/TimelinePage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { BookmarksProvider } from "./BookmarksContext";
import { useHashView } from "./useHashView";
import { useDocumentTitle } from "./useDocumentTitle";
import { useCaseData, type LoadState } from "./useCaseData";
import { loadNotes, saveNotes, withNote, type NotesStore } from "./notes";
import type { ViewId } from "./routes";

interface NotesProps {
  notes: NotesStore;
  onSaveNote: (id: string, text: string) => void;
}

const renderPage = (view: ViewId, loaded: LoadState, noteProps: NotesProps) => {
  if (loaded.status === "loading") return <p>Loading case file...</p>;
  if (loaded.status === "error") return <p>Could not load the case: {loaded.message}</p>;
  const data = loaded.data;

  switch (view) {
    case "dashboard":
      return <DashboardPage data={data} />;
    case "evidence":
      return <EvidencePage data={data} notes={noteProps.notes} onSaveNote={noteProps.onSaveNote} />;
    case "people":
      return <PeoplePage data={data} />;
    case "timeline":
      return <TimelinePage data={data} />;
    case "workspace":
      return <WorkspacePage data={data} notes={noteProps.notes} />;
  }
};

export const App = () => {
  const currentView = useHashView();
  useDocumentTitle(currentView);
  const loaded = useCaseData();

  // Bookmarks live in BookmarksProvider now. Notes stay as plain lifted state + props,
  // because only two pages use them and they are only 2 layers deep.
  const [notes, setNotes] = useState<NotesStore>(loadNotes);

  const handleSaveNote = (id: string, text: string) => {
    const next = withNote(notes, id, text);
    setNotes(next);
    saveNotes(next);
  };

  return (
    <BookmarksProvider>
      <Header currentView={currentView} />
      <main className="app-main">
        {renderPage(currentView, loaded, { notes, onSaveNote: handleSaveNote })}
      </main>
      <Footer />
    </BookmarksProvider>
  );
};

