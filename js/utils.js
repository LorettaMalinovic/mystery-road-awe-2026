import { state } from "./state.js";

export const findEvidenceById = (id) =>
  state.allEvidence.find((item) => item.id === id) || null;

export const findPersonById = (id) =>
  state.allPeople.find((item) => item.id === id) || null;

export const findLocationById = (id) =>
  state.allLocations.find((item) => item.id === id) || null;

export const evidenceMentionsPerson = (ev, person) => {
  if (!ev.personIds) return false;
  return (
    ev.personIds.indexOf(person.id) !== -1 ||
    ev.personIds.indexOf(person.name) !== -1
  );
};

export const formatDate = (ts) => {
  if (!ts) return "Unknown date";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return (
    d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) +
    " " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
};

export const getStatusBadgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "reviewed") return "badge-reviewed";
  if (s === "flagged") return "badge-flagged";
  return "badge-unreviewed";
};

export const getRelevanceBadgeClass = (relevance) => {
  const r = (relevance || "").toLowerCase();
  if (r === "relevant") return "badge-relevant";
  return "badge-unreviewed";
};

export const escapeHtml = (value) => {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
};
