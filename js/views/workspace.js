import { state } from "../state.js";
import { escapeHtml } from "../utils.js";
import { navigateTo } from "../router.js";
import { readHypothesisDraft, saveHypothesisDraft } from "../storage.js";
import { openEvidenceDetail } from "./evidence.js";

const getSelectedOptions = (selectEl) => {
  const result = [];
  for (const option of selectEl.options) {
    if (option.selected) result.push(option.value);
  }
  return result;
};

export const populateHypothesisDropdowns = () => {
  const suspectSelect = document.getElementById("hypSuspect");
  const evidenceSelect = document.getElementById("hypEvidence");
  if (!suspectSelect || !evidenceSelect) return;

  const currentSuspect = suspectSelect.value;
  const currentEvidenceIds = getSelectedOptions(evidenceSelect);

  suspectSelect.innerHTML = '<option value="">Select a person…</option>';
  for (const person of state.allPeople) {
    suspectSelect.innerHTML += '<option value="' + person.id + '">' + person.name + "</option>";
  }
  suspectSelect.value = currentSuspect;

  evidenceSelect.innerHTML = "";
  for (const item of state.allEvidence) {
    evidenceSelect.innerHTML += '<option value="' + item.id + '">' + item.id + " - " + item.title + "</option>";
  }
  for (const option of evidenceSelect.options) {
    option.selected = currentEvidenceIds.indexOf(option.value) !== -1;
  }
};

const renderBookmarksList = () => {
  const container = document.getElementById("bookmarksList");
  if (!container) return;

  const bookmarkedItems = state.allEvidence.filter((ev) => ev.bookmarked);

  if (bookmarkedItems.length === 0) {
    container.innerHTML = "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";
    return;
  }

  let html = "";
  for (const ev of bookmarkedItems) {
    html += '<div class="mini-list-item"><strong>' + ev.id + "</strong> &mdash; " + ev.title +
      ' <button type="button" class="btn btn-small btn-secondary" data-open-evidence="' + ev.id + '">Open</button></div>';
  }
  container.innerHTML = html;

  const openButtons = container.querySelectorAll("[data-open-evidence]");
  for (const btn of openButtons) {
    btn.addEventListener("click", (e) => {
      navigateTo("evidence");
      const id = e.target.getAttribute("data-open-evidence");
      setTimeout(() => {
        openEvidenceDetail(id);
      }, 0);
    });
  }
};

const renderNotesList = () => {
  const container = document.getElementById("notesList");
  if (!container) return;

  const noteEntries = [];
  for (let i = 0; i < state.allEvidence.length; i++) {
    const note = state.notesStore[state.allEvidence[i].id];
    if (note) {
      noteEntries.push({
        index: i,
        evidenceId: state.allEvidence[i].id,
        title: state.allEvidence[i].title,
        text: note
      });
    }
  }

  if (noteEntries.length === 0) {
    container.innerHTML = "<p>No notes yet. Add one from an evidence item's detail view.</p>";
    return;
  }

  let html = "";
  for (const entry of noteEntries) {
    html += '<div class="mini-list-item"><strong>' + entry.evidenceId + "</strong> &mdash; " + escapeHtml(entry.title);
    html += '<div id="noteText-' + entry.index + '">' + escapeHtml(entry.text) + "</div></div>";
  }
  container.innerHTML = html;
};

const loadHypothesisFromStorage = () => {
  const draft = readHypothesisDraft();
  if (!draft) return;

  document.getElementById("hypSuspect").value = draft.suspectId || "";
  document.getElementById("hypNature").value = draft.nature || "";
  document.getElementById("hypConfidence").value = draft.confidence || 50;
  document.getElementById("hypConfidenceValue").textContent = draft.confidence || 50;
  document.getElementById("hypExplanation").value = draft.explanation || "";
  document.getElementById("hypAlternative").value = draft.alternative || "";

  const evidenceSelect = document.getElementById("hypEvidence");
  const savedIds = draft.evidenceIds || [];
  for (const option of evidenceSelect.options) {
    option.selected = savedIds.indexOf(option.value) !== -1;
  }
};

export const saveHypothesis = () => {
  const draft = {
    suspectId: document.getElementById("hypSuspect").value,
    nature: document.getElementById("hypNature").value,
    evidenceIds: getSelectedOptions(document.getElementById("hypEvidence")),
    confidence: document.getElementById("hypConfidence").value,
    explanation: document.getElementById("hypExplanation").value,
    alternative: document.getElementById("hypAlternative").value,
    savedAt: new Date().toISOString()
  };

  try {
    saveHypothesisDraft(draft);
  } catch (err) {
    console.error("Could not save hypothesis draft", err);
    alert("Your hypothesis could not be saved to local storage.");
    return;
  }

  const msg = document.getElementById("hypothesisSavedMsg");
  msg.classList.remove("hidden");
  setTimeout(() => {
    msg.classList.add("hidden");
  }, 2000);
};

export function renderWorkspace() {
  renderBookmarksList();
  renderNotesList();
  populateHypothesisDropdowns();
  loadHypothesisFromStorage();
}

export const setupWorkspaceListeners = () => {
  document.getElementById("saveHypothesisBtn").addEventListener("click", saveHypothesis);
  document.getElementById("hypConfidence").addEventListener("input", (e) => {
    document.getElementById("hypConfidenceValue").textContent = e.target.value;
  });
};
