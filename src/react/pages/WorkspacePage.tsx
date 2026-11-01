import type { CaseFile } from "../useCaseData";
import type { NotesStore } from "../notes";
import { useBookmarks } from "../BookmarksContext";
import { BookmarksList } from "../components/BookmarksList";
import { NotesList, type NoteEntry } from "../components/NotesList";
import { HypothesisForm } from "../components/HypothesisForm";

interface WorkspacePageProps {
  data: CaseFile;
  notes: NotesStore;
}

export const WorkspacePage = ({ data, notes }: WorkspacePageProps) => {
  const { bookmarkedIds, onToggleBookmark } = useBookmarks();

  // DERIVED from the single source of truth (the bookmarks context), not stored again
  const bookmarked = data.evidence.filter((ev) => bookmarkedIds.includes(ev.id));

  const entries: NoteEntry[] = Object.entries(notes).map(([evidenceId, text]) => ({
    evidenceId,
    title: data.evidence.find((ev) => ev.id === evidenceId)?.title ?? "(unknown evidence)",
    text,
  }));

  return (
    <section className="view active">
      <h2>Investigator Workspace</h2>

      <div className="workspace-grid">
        <div className="workspace-col">
          <h3>Bookmarked Evidence</h3>
          <BookmarksList items={bookmarked} onRemove={onToggleBookmark} />
        </div>

        <div className="workspace-col">
          <h3>Personal Notes</h3>
          <p className="hint-text">Notes are written on the evidence cards in the Evidence view.</p>
          <NotesList entries={entries} />
        </div>
      </div>

      <HypothesisForm people={data.people} evidence={data.evidence} />
    </section>
  );
};
