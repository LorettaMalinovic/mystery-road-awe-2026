import { state, viewRendered } from "../state.js";
import {
  escapeHtml,
  evidenceMentionsPerson,
  findEvidenceById,
  findLocationById,
  findPersonById,
  formatDate,
  getRelevanceBadgeClass,
  getStatusBadgeClass
} from "../utils.js";
import {
  loadNoteForEvidence,
  saveBookmarksToStorage,
  saveNoteForEvidence
} from "../storage.js";

let latestSearchRequestId = 0;
let evidenceListListenerBound = false;

const simulateAsyncSearch = (term) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(term);
    }, 300);
  });

const sortEvidenceCopy = (items) => {
  const sortSelect = document.getElementById("sortEvidence");
  const sortValue = sortSelect ? sortSelect.value : "date-desc";
  const sorted = items.slice();

  if (sortValue === "title-asc") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "title-desc") {
    sorted.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortValue === "date-asc") {
    sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } else {
    sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  return sorted;
};

export const populateEvidenceDropdowns = () => {
  const typeSelect = document.getElementById("filterType");
  const personSelect = document.getElementById("filterPerson");
  const locationSelect = document.getElementById("filterLocation");
  if (!typeSelect || !personSelect || !locationSelect) return;

  const types = [];
  for (const item of state.allEvidence) {
    const t = item.type.toLowerCase();
    if (types.indexOf(t) === -1) types.push(t);
  }
  typeSelect.innerHTML = '<option value="">All types</option>';
  for (const typeName of types) {
    typeSelect.innerHTML += '<option value="' + typeName + '">' + typeName + "</option>";
  }

  personSelect.innerHTML = '<option value="">All people</option>';
  for (const person of state.allPeople) {
    personSelect.innerHTML += '<option value="' + person.id + '">' + person.name + "</option>";
  }

  locationSelect.innerHTML = '<option value="">All locations</option>';
  for (const loc of state.allLocations) {
    locationSelect.innerHTML += '<option value="' + loc.id + '">' + loc.id + " - " + loc.name + "</option>";
  }
};

const getFilteredEvidence = () => {
  const searchBox = document.getElementById("evidenceSearch");
  const searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : "";
  const typeVal = document.getElementById("filterType").value;
  const personVal = document.getElementById("filterPerson").value;
  const locationVal = document.getElementById("filterLocation").value;
  const statusVal = document.getElementById("filterStatus").value;
  const relevanceVal = document.getElementById("filterRelevance").value;

  const results = [];
  for (const item of state.allEvidence) {
    let matches = true;

    if (searchTerm) {
      const haystack = (item.title + " " + item.summary + " " + item.tags.join(" ")).toLowerCase();
      if (haystack.indexOf(searchTerm) === -1) matches = false;
    }
    if (matches && typeVal && item.type.toLowerCase() !== typeVal) matches = false;
    if (matches && personVal) {
      const person = findPersonById(personVal);
      if (!person || !evidenceMentionsPerson(item, person)) matches = false;
    }
    if (matches && locationVal && item.locationIds.indexOf(locationVal) === -1) matches = false;
    if (matches && statusVal && (item.status || "").toLowerCase() !== statusVal) matches = false;
    if (matches && relevanceVal && (item.relevance || "").toLowerCase() !== relevanceVal) matches = false;

    if (matches) results.push(item);
  }

  state.filteredEvidence = sortEvidenceCopy(results);
  return state.filteredEvidence;
};

const renderEvidenceCardHTML = (ev) => {
  const isBookmarked = state.bookmarks.indexOf(ev.id) !== -1;
  let html = '<div class="evidence-card" data-id="' + ev.id + '">';
  html += '<button class="bookmark-btn ' + (isBookmarked ? "active" : "") + '" data-action="bookmark" data-id="' + ev.id + '" aria-label="Toggle bookmark for ' + ev.title + '"><span class="bookmark-icon">' + (isBookmarked ? "★" : "☆") + "</span></button>";
  html += "<h3>" + ev.title + "</h3>";
  html += '<div class="evidence-meta">' + ev.id + " &middot; " + ev.type + " &middot; " + formatDate(ev.timestamp) + "</div>";
  html += '<div class="evidence-summary">' + ev.summary + "</div>";

  if (ev.tags.indexOf("critical") !== -1) {
    html += '<span class="badge badge-critical">Critical</span>';
  }
  html += '<span class="badge ' + getStatusBadgeClass(ev.status) + '">' + ev.status + "</span>";
  html += '<span class="badge ' + getRelevanceBadgeClass(ev.relevance) + '">' + ev.relevance + "</span>";
  html += "<div>";
  for (const tag of ev.tags) {
    html += '<span class="tag-chip">' + tag + "</span>";
  }
  html += "</div>";
  html += "</div>";
  return html;
};

const handleBookmarkClick = (evidenceId) => {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  if (state.bookmarks.indexOf(evidenceId) === -1) {
    state.bookmarks.push(evidenceId);
    ev.bookmarked = true;
  } else {
    state.bookmarks = state.bookmarks.filter((id) => id !== evidenceId);
    ev.bookmarked = false;
  }
  saveBookmarksToStorage();
  if (state.currentPage === "evidence") renderEvidenceList();
};

export const applyStoredBookmarkFlags = () => {
  for (const item of state.allEvidence) {
    item.bookmarked = state.bookmarks.indexOf(item.id) !== -1;
  }
};

const handleEvidenceListClick = (event) => {
  const target = event.target;

  if (target.dataset && target.dataset.action === "bookmark") {
    event.stopPropagation();
    handleBookmarkClick(target.dataset.id);
    return;
  }

  const card = target.closest(".evidence-card");
  if (card) {
    openEvidenceDetail(card.getAttribute("data-id"));
  }
};

export function renderEvidenceList() {
  const container = document.getElementById("evidenceList");
  if (!container) return;

  const loadingIndicator = document.getElementById("evidenceLoadingIndicator");
  if (state.evidenceViewLoading) {
    if (loadingIndicator) loadingIndicator.classList.remove("hidden");
    container.innerHTML = "";
    return;
  }
  if (loadingIndicator) loadingIndicator.classList.add("hidden");

  const results = getFilteredEvidence();

  let html = "";
  if (results.length === 0) {
    html = "<p>No evidence matches the current filters.</p>";
  }
  for (const item of results) {
    html += renderEvidenceCardHTML(item);
  }
  container.innerHTML = html;

  // Original (auskommentiert): container.addEventListener("click", handleEvidenceListClick);
  // Das hat bei jedem Rendern einen weiteren Listener registriert (Bookmark hat dann mehrfach getoggelt).
}

export const handleSortChange = () => {
  // Demo 2: Original hat filteredEvidence.sort(...) in-place aufgerufen.
  // Das hat allEvidence mit sortiert. Jetzt nur neu rendern; Sortierung läuft auf einer Kopie.
  renderEvidenceList();
};

const clearFilters = () => {
  document.getElementById("evidenceSearch").value = "";
  document.getElementById("filterType").value = "";
  document.getElementById("filterPerson").value = "";
  document.getElementById("filterLocation").value = "";
  document.getElementById("filterStatus").value = "";
  document.getElementById("filterRelevance").value = "";
  renderEvidenceList();
};

const handleSearchInput = async (event) => {
  const requestId = ++latestSearchRequestId;
  // Original: simulateAsyncSearch(term).then(function (resolvedTerm) { ... });
  await simulateAsyncSearch(event.target.value);
  if (requestId !== latestSearchRequestId) return;
  renderEvidenceList();
};

const statusOptionHTML = (current, value, label) => {
  const currentLower = (current || "").toLowerCase();
  const selected = currentLower === value ? " selected" : "";
  return '<option value="' + value + '"' + selected + ">" + label + "</option>";
};

export function closeEvidenceDetail() {
  const section = document.getElementById("evidenceDetailSection");
  section.classList.add("hidden");
  section.innerHTML = "";
  state.selectedEvidence = null;
}

export const saveCurrentNote = () => {
  const textarea = document.getElementById("evidenceNoteInput");
  if (!textarea) return;
  const evidenceId = textarea.getAttribute("data-evidence-id");
  const text = textarea.value;
  saveNoteForEvidence(evidenceId, text);
  const preview = document.getElementById("notePreview");
  // Original: preview.innerHTML = text;  (XSS)
  if (preview) preview.textContent = text;
};

function renderEvidenceDetail(ev) {
  const section = document.getElementById("evidenceDetailSection");

  const personNames = ev.personIds.map((id) => {
    const person = findPersonById(id);
    return person ? person.name : id;
  });

  const locationNames = ev.locationIds.map((id) => {
    const loc = findLocationById(id);
    return loc ? loc.id + " - " + loc.name : id;
  });

  let tagsHtml = "";
  for (const tag of ev.tags) {
    tagsHtml += '<span class="tag-chip">' + tag + "</span>";
  }

  const storedNote = loadNoteForEvidence(ev.id);

  let html = "";
  html += '<div class="evidence-detail-header">';
  html += "<div><h2>" + ev.title + "</h2>";
  html += '<div class="evidence-meta">' + ev.id + " &middot; " + ev.type + " &middot; " + formatDate(ev.timestamp) + "</div></div>";
  html += '<button type="button" class="btn btn-secondary btn-small" onclick="closeEvidenceDetail()">Close</button>';
  html += "</div>";

  if (ev.tags.indexOf("critical") !== -1) {
    html += '<div class="warning-banner">This item is tagged as critical evidence.</div>';
  }

  html += '<div class="detail-field"><strong>Summary</strong>' + ev.summary + "</div>";
  html += '<div class="evidence-detail-content">' + ev.content + "</div>";
  html += '<div class="detail-field"><strong>Related people</strong>' + personNames.join(", ") + "</div>";
  html += '<div class="detail-field"><strong>Related locations</strong>' + locationNames.join(", ") + "</div>";
  html += '<div class="detail-field"><strong>Tags</strong>' + tagsHtml + "</div>";

  html += '<div class="detail-field"><strong>Review status</strong>';
  html += '<select id="detailStatusSelect">';
  html += statusOptionHTML(ev.status, "unreviewed", "Unreviewed");
  html += statusOptionHTML(ev.status, "reviewed", "Reviewed");
  html += statusOptionHTML(ev.status, "flagged", "Flagged");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Relevance</strong>';
  html += '<select id="detailRelevanceSelect">';
  html += statusOptionHTML(ev.relevance, "unknown", "Unknown");
  html += statusOptionHTML(ev.relevance, "relevant", "Relevant");
  html += statusOptionHTML(ev.relevance, "irrelevant", "Irrelevant");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Investigator note</strong>';
  html += '<textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="' + ev.id + '" placeholder="Add a private note about this evidence...">' + escapeHtml(storedNote) + "</textarea>";
  html += '<button type="button" class="btn btn-primary btn-small" style="margin-top:6px;" onclick="saveCurrentNote()">Save note</button>';
  html += "</div>";

  html += '<div class="detail-field"><strong>Note preview</strong><div id="notePreview"></div></div>';

  section.innerHTML = html;
  document.getElementById("notePreview").textContent = storedNote;

  document.getElementById("detailStatusSelect").addEventListener("change", (e) => {
    ev.status = e.target.value;
    renderEvidenceDetail(ev);
    if (viewRendered.evidence) renderEvidenceList();
  });
  document.getElementById("detailRelevanceSelect").addEventListener("change", (e) => {
    ev.relevance = e.target.value;
    renderEvidenceDetail(ev);
    if (viewRendered.evidence) renderEvidenceList();
  });
}

export function openEvidenceDetail(evidenceId) {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;
  state.selectedEvidence = ev;

  const section = document.getElementById("evidenceDetailSection");
  section.classList.remove("hidden");

  renderEvidenceDetail(ev);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

export const setupEvidenceListeners = () => {
  document.getElementById("evidenceSearch").addEventListener("input", handleSearchInput);
  document.getElementById("filterType").addEventListener("change", renderEvidenceList);
  document.getElementById("filterPerson").addEventListener("change", renderEvidenceList);
  document.getElementById("filterLocation").addEventListener("change", renderEvidenceList);
  document.getElementById("filterStatus").addEventListener("change", renderEvidenceList);
  document.getElementById("filterRelevance").addEventListener("change", renderEvidenceList);
  // Original: document.getElementById("filterStatus").setAttribute("onchange", "renderEvidenceList()");
  // (doppelt mit addEventListener — auskommentiert)
  // Sort bleibt per HTML onchange="handleSortChange()" in index.html.
  document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);

  if (!evidenceListListenerBound) {
    document.getElementById("evidenceList").addEventListener("click", handleEvidenceListClick);
    evidenceListListenerBound = true;
  }
};
