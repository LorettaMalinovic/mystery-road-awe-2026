import { useState } from "react";
import type { CaseFile } from "../useCaseData";
import type { NotesStore } from "../notes";
import {
  initialFilters,
  selectEvidence,
  type EvidenceFilters,
  type FilterKey,
  type SortKey,
} from "../evidenceFilters";
import { EvidenceToolbar } from "../components/EvidenceToolbar";
import { EvidenceList } from "../components/EvidenceList";

interface EvidencePageProps {
  data: CaseFile;
  bookmarkedIds: readonly string[];
  notes: NotesStore;
  onToggleBookmark: (id: string) => void;
  onSaveNote: (id: string, text: string) => void;
}

export const EvidencePage = ({
  data,
  bookmarkedIds,
  notes,
  onToggleBookmark,
  onSaveNote,
}: EvidencePageProps) => {
  // Demo 4/5 version: one useState per value (7 of them). Demo 7 replaces this with useReducer.
  const [search, setSearch] = useState(initialFilters.search);
  const [type, setType] = useState(initialFilters.type);
  const [person, setPerson] = useState(initialFilters.person);
  const [location, setLocation] = useState(initialFilters.location);
  const [status, setStatus] = useState(initialFilters.status);
  const [relevance, setRelevance] = useState(initialFilters.relevance);
  const [sort, setSort] = useState<SortKey>(initialFilters.sort);

  const filters: EvidenceFilters = { search, type, person, location, status, relevance, sort };

  const handleFilter = (key: FilterKey, value: string) => {
    switch (key) {
      case "search":
        setSearch(value);
        break;
      case "type":
        setType(value);
        break;
      case "person":
        setPerson(value);
        break;
      case "location":
        setLocation(value);
        break;
      case "status":
        setStatus(value);
        break;
      case "relevance":
        setRelevance(value);
        break;
    }
  };

  const handleClear = () => {
    setSearch(initialFilters.search);
    setType(initialFilters.type);
    setPerson(initialFilters.person);
    setLocation(initialFilters.location);
    setStatus(initialFilters.status);
    setRelevance(initialFilters.relevance);
    setSort(initialFilters.sort);
  };

  // DERIVED, not stored: computed from the full list + filter state on every render
  const visible = selectEvidence(data.evidence, filters, data.people);

  return (
    <section className="view active">
      <h2>Evidence Catalogue</h2>
      <EvidenceToolbar
        filters={filters}
        evidence={data.evidence}
        people={data.people}
        locations={data.locations}
        onFilter={handleFilter}
        onSort={setSort}
        onClear={handleClear}
      />
      <p className="hint-text">
        Showing {visible.length} of {data.evidence.length} items
      </p>
      <EvidenceList
        items={visible}
        bookmarkedIds={bookmarkedIds}
        notes={notes}
        onToggleBookmark={onToggleBookmark}
        onSaveNote={onSaveNote}
      />
    </section>
  );
};
