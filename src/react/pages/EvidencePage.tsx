import { useReducer } from "react";
import type { CaseFile } from "../useCaseData";
import type { NotesStore } from "../notes";
import { initialFilters, selectEvidence } from "../evidenceFilters";
import { evidenceFiltersReducer } from "../evidenceFiltersReducer";
import { EvidenceToolbar } from "../components/EvidenceToolbar";
import { EvidenceList } from "../components/EvidenceList";

interface EvidencePageProps {
  data: CaseFile;
  notes: NotesStore;
  onSaveNote: (id: string, text: string) => void;
}

export const EvidencePage = ({ data, notes, onSaveNote }: EvidencePageProps) => {
  const [filters, dispatch] = useReducer(evidenceFiltersReducer, initialFilters);

  const visible = selectEvidence(data.evidence, filters, data.people);

  return (
    <section className="view active">
      <h2>Evidence Catalogue</h2>
      <EvidenceToolbar
        filters={filters}
        evidence={data.evidence}
        people={data.people}
        locations={data.locations}
        onFilter={(key, value) => dispatch({ type: "SET_FILTER", key, value })}
        onSort={(sort) => dispatch({ type: "SET_SORT", sort })}
        onClear={() => dispatch({ type: "CLEAR_FILTERS" })}
      />
      <p className="hint-text">
        Showing {visible.length} of {data.evidence.length} items
      </p>
      <EvidenceList items={visible} notes={notes} onSaveNote={onSaveNote} />
    </section>
  );
};
