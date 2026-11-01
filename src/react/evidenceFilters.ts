import type { Evidence, Person } from "../../js/types";

export type SortKey = "date-desc" | "date-asc" | "title-asc" | "title-desc";

export interface EvidenceFilters {
  search: string;
  type: string;
  person: string;
  location: string;
  status: string;
  relevance: string;
  sort: SortKey;
}

export type FilterKey = Exclude<keyof EvidenceFilters, "sort">;

export const initialFilters: EvidenceFilters = {
  search: "",
  type: "",
  person: "",
  location: "",
  status: "",
  relevance: "",
  sort: "date-desc",
};

export const isSortKey = (value: string): value is SortKey =>
  value === "date-desc" || value === "date-asc" || value === "title-asc" || value === "title-desc";

// Pure function: full list + filter state in, NEW sorted list out.
// Nothing is stored. The list is recomputed on every render.
export const selectEvidence = (
  all: readonly Evidence[],
  filters: EvidenceFilters,
  people: readonly Person[],
): Evidence[] => {
  const query = filters.search.trim().toLowerCase();
  const person = people.find((p) => p.id === filters.person);

  // filter() always returns a NEW array, so the master list is never shared
  const matches = all.filter((ev) => {
    if (query !== "") {
      const haystack = `${ev.title} ${ev.summary} ${ev.tags.join(" ")}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.type !== "" && ev.type.toLowerCase() !== filters.type) return false;
    if (filters.person !== "") {
      // personIds mixes ids ("P01") and display names ("Nova Byte")
      const byId = ev.personIds.includes(filters.person);
      const byName = person !== undefined && ev.personIds.includes(person.name);
      if (!byId && !byName) return false;
    }
    if (filters.location !== "" && !ev.locationIds.includes(filters.location)) return false;
    if (filters.status !== "" && ev.status.toLowerCase() !== filters.status) return false;
    if (filters.relevance !== "" && ev.relevance.toLowerCase() !== filters.relevance) return false;
    return true;
  });

  // sort a COPY, never the input (this was the Exercise 1 bug)
  return [...matches].sort((a, b) => {
    switch (filters.sort) {
      case "date-desc":
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case "date-asc":
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
    }
  });
};
