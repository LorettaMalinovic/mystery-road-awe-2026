import type { CaseFile } from "../useCaseData";
import { BookmarksList } from "../components/BookmarksList";
import { NotesList } from "../components/NotesList";
import { HypothesisForm } from "../components/HypothesisForm";

interface WorkspacePageProps {
  data: CaseFile;
}

export const WorkspacePage = ({ data }: WorkspacePageProps) => (
  <section className="view active">
    <h2>Investigator Workspace</h2>

    <div className="workspace-grid">
      <div className="workspace-col">
        <h3>Bookmarked Evidence</h3>
        {/* empty for now: bookmark state is lifted in Demo 5 */}
        <BookmarksList items={[]} />
      </div>

      <div className="workspace-col">
        <h3>Personal Notes</h3>
        <p className="hint-text">
          Notes are attached to whichever evidence item is currently open in the Evidence view.
        </p>
        {/* empty for now: notes are wired in a later step */}
        <NotesList entries={[]} />
      </div>
    </div>

    <HypothesisForm people={data.people} evidence={data.evidence} />
  </section>
);
