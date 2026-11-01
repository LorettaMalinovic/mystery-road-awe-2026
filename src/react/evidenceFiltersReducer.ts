import { initialFilters, type EvidenceFilters, type FilterKey, type SortKey } from "./evidenceFilters";

export type EvidenceFilterAction =
  | { type: "SET_FILTER"; key: FilterKey; value: string }
  | { type: "SET_SORT"; sort: SortKey }
  | { type: "CLEAR_FILTERS" };

export const evidenceFiltersReducer = (
  state: EvidenceFilters,
  action: EvidenceFilterAction,
): EvidenceFilters => {
  switch (action.type) {
    case "SET_FILTER":
      return { ...state, [action.key]: action.value };
    case "SET_SORT":
      return { ...state, sort: action.sort };
    case "CLEAR_FILTERS":
      // ONE line resets all 7 values. Nobody can forget one.
      return initialFilters;
  }
};
