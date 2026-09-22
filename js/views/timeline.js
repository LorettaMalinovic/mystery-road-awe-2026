import { state } from "../state.js";
import { findEvidenceById, findLocationById, formatDate } from "../utils.js";
import { navigateTo } from "../router.js";
import { openEvidenceDetail } from "./evidence.js";

export const populateTimelineDropdowns = () => {
  const personSelect = document.getElementById("timelinePersonFilter");
  const locationSelect = document.getElementById("timelineLocationFilter");
  const typeSelect = document.getElementById("timelineTypeFilter");
  if (!personSelect || !locationSelect || !typeSelect) return;

  personSelect.innerHTML = '<option value="">All people</option>';
  for (const person of state.allPeople) {
    personSelect.innerHTML += '<option value="' + person.id + '">' + person.name + "</option>";
  }

  locationSelect.innerHTML = '<option value="">All locations</option>';
  for (const loc of state.allLocations) {
    locationSelect.innerHTML += '<option value="' + loc.id + '">' + loc.id + "</option>";
  }

  const types = [];
  for (const evt of state.allTimeline) {
    if (types.indexOf(evt.type) === -1) types.push(evt.type);
  }
  typeSelect.innerHTML = '<option value="">All event types</option>';
  for (const typeName of types) {
    typeSelect.innerHTML += '<option value="' + typeName + '">' + typeName + "</option>";
  }
};

const certaintyBadgeClass = (certainty) => {
  if (certainty === "confirmed") return "reviewed";
  if (certainty === "contradictory") return "critical";
  if (certainty === "reported") return "flagged";
  return "unreviewed";
};

const closeEvidenceModal = () => {
  const modal = document.getElementById("quickViewModal");
  if (modal) modal.innerHTML = "";
};

export function openEvidenceModal(evidenceId) {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  let modal = document.getElementById("quickViewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quickViewModal";
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-close-btn") || e.target.classList.contains("modal-backdrop")) {
        closeEvidenceModal();
      }
      const fullId = e.target.getAttribute && e.target.getAttribute("data-open-full");
      if (fullId) {
        closeEvidenceModal();
        navigateTo("evidence");
        setTimeout(() => {
          openEvidenceDetail(fullId);
        }, 0);
      }
    });
  }

  modal.innerHTML =
    '<div class="modal-backdrop"><div class="modal-box">' +
    '<button type="button" class="modal-close-btn" aria-label="Close">&times;</button>' +
    "<h3>" + ev.title + "</h3>" +
    '<p class="evidence-meta">' + ev.id + " &middot; " + ev.type + " &middot; " + formatDate(ev.timestamp) + "</p>" +
    "<p>" + ev.summary + "</p>" +
    '<button type="button" class="btn btn-primary btn-small" data-open-full="' + ev.id + '">Open full evidence</button>' +
    "</div></div>";
}

export function renderTimeline() {
  const container = document.getElementById("timelineContainer");
  if (!container) return;

  const order = document.getElementById("timelineOrder").value;
  const personFilter = document.getElementById("timelinePersonFilter").value;
  const locationFilter = document.getElementById("timelineLocationFilter").value;
  const typeFilter = document.getElementById("timelineTypeFilter").value;

  const events = [];
  for (const evt of state.allTimeline) {
    if (personFilter && evt.personIds.indexOf(personFilter) === -1) continue;
    if (locationFilter && evt.locationIds.indexOf(locationFilter) === -1) continue;
    if (typeFilter && evt.type !== typeFilter) continue;
    events.push(evt);
  }

  events.sort((a, b) => {
    const diff = new Date(a.time) - new Date(b.time);
    return order === "desc" ? -diff : diff;
  });

  let html = "";
  for (const item of events) {
    html += '<div class="timeline-event certainty-' + item.certainty + '">';
    html += '<div class="timeline-time">' + formatDate(item.time) + '&nbsp;&middot;&nbsp;<span class="badge badge-' + certaintyBadgeClass(item.certainty) + '">' + item.certainty + "</span></div>";
    html += "<h3>" + item.title + "</h3>";
    html += "<p>" + item.description + "</p>";

    const eventLocationNames = [];
    for (const locationId of item.locationIds) {
      const evtLoc = findLocationById(locationId);
      // Original: eventLocationNames.push(evtLoc || item.locationIds[el]); → "[object Object]"
      eventLocationNames.push(evtLoc ? evtLoc.id + " - " + evtLoc.name : locationId);
    }
    if (eventLocationNames.length > 0) {
      html += '<p class="evidence-meta">Location: ' + eventLocationNames.join(", ") + "</p>";
    }

    for (const evidenceId of item.evidenceIds) {
      html += '<button type="button" class="evidence-link-btn" data-evidence-id="' + evidenceId + '">View ' + evidenceId + "</button>";
    }
    html += "</div>";
  }
  if (events.length === 0) {
    html = "<p>No timeline events match the current filters.</p>";
  }
  container.innerHTML = html;

  const linkButtons = container.querySelectorAll(".evidence-link-btn");
  for (const btn of linkButtons) {
    btn.addEventListener("click", (e) => {
      openEvidenceModal(e.target.getAttribute("data-evidence-id"));
    });
  }
}

export const setupTimelineListeners = () => {
  document.getElementById("timelineOrder").addEventListener("change", renderTimeline);
  document.getElementById("timelinePersonFilter").addEventListener("change", renderTimeline);
  document.getElementById("timelineLocationFilter").addEventListener("change", renderTimeline);
  document.getElementById("timelineTypeFilter").addEventListener("change", renderTimeline);
};
