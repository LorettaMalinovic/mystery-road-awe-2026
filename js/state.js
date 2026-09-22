// Demo 1 + 8: Original globals from app.js (commented out, not deleted):
// var allEvidence = [];
// var filteredEvidence = [];
// var selectedEvidence = null;
// var bookmarks = [];
// var currentPage = "dashboard";
// var allPeople = [];
// var allLocations = [];
// var allTimeline = [];
// var caseData = {};
// var currentPeopleTab = "people";
// var loadingStepsRemaining = 2;
// var evidenceViewLoading = true;
// var viewRendered = { dashboard: false, evidence: false, people: false, timeline: false, workspace: false };
// var notesStore = {};
// var modalCloseListenerCount = 0;
// var STORAGE_KEY_BOOKMARKS = "remotion_bookmarks";
// var STORAGE_KEY_NOTES = "remotion_notes";
// var STORAGE_KEY_HYPOTHESIS = "remotion_hypothesis";
//
// Module-Scope statt window: andere Dateien müssen importieren (sonst ReferenceError).
// const statt var: kein function-scope / kein Hoisting-Bug wie bei der Nav-Schleife.

export const STORAGE_KEY_BOOKMARKS = "remotion_bookmarks";
export const STORAGE_KEY_NOTES = "remotion_notes";
export const STORAGE_KEY_HYPOTHESIS = "remotion_hypothesis";

export const viewRendered = {
  dashboard: false,
  evidence: false,
  people: false,
  timeline: false,
  workspace: false
};

export const state = {
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
  notesStore: {}
};
