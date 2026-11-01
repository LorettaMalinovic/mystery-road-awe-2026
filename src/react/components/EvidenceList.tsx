import type { Evidence } from "../../../js/types";
import type { NotesStore } from "../notes";
import { EvidenceCard } from "./EvidenceCard";

interface EvidenceListProps {
  items: Evidence[];
  notes: NotesStore;
  onSaveNote: (id: string, text: string) => void;
}

export const EvidenceList = ({ items, notes, onSaveNote }: EvidenceListProps) => {
  if (items.length === 0) {
    return <p>No evidence matches the current filters.</p>;
  }

  return (
    <div className="evidence-grid">
      {items.map((ev) => (
        <EvidenceCard
          key={ev.id}
          evidence={ev}
          savedNote={notes[ev.id] ?? ""}
          onSaveNote={onSaveNote}
        />
      ))}
    </div>
  );
};
