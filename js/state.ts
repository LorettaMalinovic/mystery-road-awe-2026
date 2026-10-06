import type { Evidence, Person, Location, TimelineEvent, CaseData } from "./types.ts";

export const STORAGE_KEY_BOOKMARKS = "remotion_bookmarks";
export const STORAGE_KEY_NOTES = "remotion_notes";
export const STORAGE_KEY_HYPOTHESIS = "remotion_hypothesis";

export const viewRendered = {
  dashboard: false,
  evidence: false,
  people: false,
  timeline: false,
  workspace: false,
};

interface AppState {
  allEvidence: Evidence[];
  filteredEvidence: Evidence[];
  selectedEvidence: Evidence | null;
  bookmarks: string[];
  currentPage: string;
  allPeople: Person[];
  allLocations: Location[];
  allTimeline: TimelineEvent[];
  caseData: Partial<CaseData>; // {} bis das JSON geladen ist
  currentPeopleTab: string;
  loadingStepsRemaining: number;
  evidenceViewLoading: boolean;
  notesStore: Record<string, string>;
}

export const state: AppState = {
  allEvidence: [],
  filteredEvidence: [],
  selectedEvidence: null,
  bookmarks: [],
  currentPage: "dashboard",
  allPeople: [],
  allLocations: [],
  allTimeline: [],
  caseData: {},
  currentPeopleTab: "people",
  loadingStepsRemaining: 2,
  evidenceViewLoading: true,
  notesStore: {},
};