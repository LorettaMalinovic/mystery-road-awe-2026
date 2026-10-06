import { state } from "./state.ts";
import type { Evidence, Person, Location, TimelineEvent, CaseData } from "./types.ts";
import {
  applyStoredBookmarkFlags,
  populateEvidenceDropdowns,
  renderEvidenceList,
} from "./views/evidence.js";
import { populateTimelineDropdowns, renderTimeline } from "./views/timeline.js";
import { populateHypothesisDropdowns } from "./views/workspace.js";
import { renderDashboard } from "./views/dashboard.js";

const showLoadingOverlay = (msg: string): void => {
  const overlay = document.getElementById("loadingOverlay");
  const text = document.getElementById("loadingText");
  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove("hidden");
};

const hideLoadingStep = (): void => {
  state.loadingStepsRemaining--;
  if (state.loadingStepsRemaining <= 0) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
};

const populateAllDropdowns = (): void => {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
};

// T bestimmt jede Aufrufstelle selbst
const readJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to load " + url + " (" + res.status + ")");
  }
  return (await res.json()) as T;
};

export async function loadCorePeopleAndLocations(): Promise<void> {
  state.caseData = await readJson<CaseData>("data/case.json");
  state.allPeople = await readJson<Person[]>("data/people.json");
  state.allLocations = await readJson<Location[]>("data/locations.json");

  hideLoadingStep();
  renderDashboard();
  populateAllDropdowns();
}

export async function loadEvidenceData(): Promise<void> {
  try {
    state.allEvidence = await readJson<Evidence[]>("data/evidence.json");
    applyStoredBookmarkFlags();
    state.filteredEvidence = state.allEvidence.slice();
    state.evidenceViewLoading = false;
    renderDashboard();
    populateAllDropdowns();
    if (state.currentPage === "evidence") renderEvidenceList();
  } catch (err) {
    console.error("Failed to load evidence.json", err);
    state.evidenceViewLoading = false;
    alert("Evidence could not be loaded. Some views may be incomplete.");
  }
}

export async function loadTimelineData(): Promise<void> {
  try {
    state.allTimeline = await readJson<TimelineEvent[]>("data/timeline.json");
    renderDashboard();
    if (state.currentPage === "timeline") renderTimeline();
    populateAllDropdowns();
  } catch (err) {
    console.error("timeline load error", err);
  } finally {
    hideLoadingStep();
  }
}

export async function loadAllData(): Promise<void> {
  showLoadingOverlay("Loading case file…");
  state.loadingStepsRemaining = 2;
  try {
    await loadCorePeopleAndLocations();
  } catch (err) {
    console.error("Failed to load core case data", err);
    hideLoadingStep();
  }
  loadEvidenceData();
  await loadTimelineData();
}