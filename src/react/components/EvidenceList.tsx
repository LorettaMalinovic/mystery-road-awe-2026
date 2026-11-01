import type { Evidence } from "../../../js/types";
import type { NotesStore } from "../notes";
import { EvidenceCard } from "./EvidenceCard";

interface EvidenceListProps {
  items: Evidence[];
  bookmarkedIds: readonly string[];
  notes: NotesStore;
  onToggleBookmark: (id: string) => void;
  onSaveNote: (id: string, text: string) => void;
}

export const EvidenceList = ({
  items,
  bookmarkedIds,
  notes,
  onToggleBookmark,
  onSaveNote,
}: EvidenceListProps) => {
  if (items.length === 0) {
    return <p>No evidence matches the current filters.</p>;
  }

  return (
    <div className="evidence-grid">
      {items.map((ev) => (
        <EvidenceCard
          key={ev.id}
          evidence={ev}
          isBookmarked={bookmarkedIds.includes(ev.id)}
          savedNote={notes[ev.id] ?? ""}
          onToggleBookmark={onToggleBookmark}
          onSaveNote={onSaveNote}
        />
      ))}
    </div>
  );
};
