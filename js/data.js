import { state } from "./state.js";
import { applyStoredBookmarkFlags, populateEvidenceDropdowns, renderEvidenceList } from "./views/evidence.js";
import { populateTimelineDropdowns, renderTimeline } from "./views/timeline.js";
import { populateHypothesisDropdowns } from "./views/workspace.js";
import { renderDashboard } from "./views/dashboard.js";

const showLoadingOverlay = (msg) => {
  const overlay = document.getElementById("loadingOverlay");
  const text = document.getElementById("loadingText");
  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove("hidden");
};

const hideLoadingStep = () => {
  state.loadingStepsRemaining--;
  if (state.loadingStepsRemaining <= 0) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
};

const populateAllDropdowns = () => {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
};

const readJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to load " + url + " (" + res.status + ")");
  }
  return res.json();
};

// Demo 9: Original nested .then() chain (commented out, same sequential order kept):
// function loadCorePeopleAndLocations() {
//   return fetch("data/case.json").then(function (caseRes) {
//     return caseRes.json().then(function (caseJson) {
//       caseData = caseJson;
//       return fetch("data/people.json").then(function (peopleRes) {
//         return peopleRes.json().then(function (peopleJson) {
//           allPeople = peopleJson;
//           return fetch("data/locations.json").then(function (locationsRes) {
//             return locationsRes.json().then(function (locationsJson) {
//               allLocations = locationsJson;
//               hideLoadingStep();
//               renderDashboard();
//               populateAllDropdowns();
//             });
//           });
//         });
//       });
//     });
//   });
// }

export async function loadCorePeopleAndLocations() {
  const caseJson = await readJson("data/case.json");
  state.caseData = caseJson;

  const peopleJson = await readJson("data/people.json");
  state.allPeople = peopleJson;

  const locationsJson = await readJson("data/locations.json");
  state.allLocations = locationsJson;

  hideLoadingStep();
  renderDashboard();
  populateAllDropdowns();
}

export async function loadEvidenceData() {
  try {
    const data = await readJson("data/evidence.json");
    state.allEvidence = data;
    applyStoredBookmarkFlags();
    // Demo 2: Original: filteredEvidence = allEvidence;  (gleiche Referenz → .sort() mutiert allEvidence)
    state.filteredEvidence = state.allEvidence.slice();
    // Demo 3: Original ließ evidenceViewLoading forever true → Spinner blieb.
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

export async function loadTimelineData() {
  try {
    const data = await readJson("data/timeline.json");
    state.allTimeline = data;
    renderDashboard();
    if (state.currentPage === "timeline") renderTimeline();
    populateAllDropdowns();
  } catch (err) {
    console.error("timeline load error", err);
  } finally {
    hideLoadingStep();
  }
}

export async function loadAllData() {
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
