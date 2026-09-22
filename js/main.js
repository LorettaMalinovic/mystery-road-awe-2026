import { state, viewRendered } from "./state.js";
import { loadAllData } from "./data.js";
import { loadBookmarksFromStorage, loadNoteAsync, loadNotesFromStorage } from "./storage.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderEvidenceList, setupEvidenceListeners } from "./views/evidence.js";
import { renderLocations, renderPeople } from "./views/people.js";
import { renderTimeline, setupTimelineListeners } from "./views/timeline.js";
import { renderWorkspace } from "./views/workspace.js";

// Demo 1: Original hat handleHashChange + Listener zweimal registriert
// (setupEventListeners UND extra window.addEventListener am Dateiende).
// Nur noch einmal hier.

function handleHashChange() {
  let hash = window.location.hash.replace("#", "");
  const validViews = ["dashboard", "evidence", "people", "timeline", "workspace"];
  if (validViews.indexOf(hash) === -1) {
    hash = "dashboard";
  }
  state.currentPage = hash;

  const sections = document.querySelectorAll(".view");
  for (const section of sections) {
    section.classList.remove("active");
  }
  document.getElementById("view-" + hash).classList.add("active");

  const navButtons = document.querySelectorAll(".nav-btn");
  for (const btn of navButtons) {
    btn.classList.remove("active");
    if (btn.getAttribute("data-view") === hash) {
      btn.classList.add("active");
    }
  }

  // Dashboard immer neu zeichnen, sonst bleiben Bookmark-/Review-Zahlen stehen.
  if (hash === "dashboard") {
    renderDashboard();
    viewRendered.dashboard = true;
  } else if (hash === "evidence" && !viewRendered.evidence) {
    renderEvidenceList();
    viewRendered.evidence = true;
  } else if (hash === "people" && !viewRendered.people) {
    renderPeople();
    renderLocations();
    viewRendered.people = true;
  } else if (hash === "timeline" && !viewRendered.timeline) {
    renderTimeline();
    viewRendered.timeline = true;
  } else if (hash === "workspace") {
    renderWorkspace();
  }
}

const setupEventListeners = () => {
  window.addEventListener("hashchange", handleHashChange);

  // Demo 4 — Original (auskommentiert, var-Closure → TypeError in der Console):
  // var navButtons = document.querySelectorAll(".nav-btn");
  // for (var i = 0; i < navButtons.length; i++) {
  //   navButtons[i].addEventListener("click", function () {
  //     var targetView = navButtons[i].getAttribute("data-view");
  //     console.log("nav clicked:", targetView);
  //   });
  // }
  // Navigation bleibt über onclick="navigateTo(...)" in index.html.

  setupEvidenceListeners();
  setupTimelineListeners();

  document.getElementById("hypConfidence").addEventListener("input", (e) => {
    document.getElementById("hypConfidenceValue").textContent = e.target.value;
  });
};

export async function initApp() {
  loadBookmarksFromStorage();
  loadNotesFromStorage();
  setupEventListeners();

  await loadAllData();
  handleHashChange();

  // Demo 3: Original: var firstNote = loadNoteAsync("E01"); console.log(firstNote);
  // (logged eine Promise, nicht den Text)
  const firstNote = await loadNoteAsync("E01");
  if (firstNote) {
    console.log("First note preview:", firstNote);
  }
}
