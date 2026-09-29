import { state } from "./state.js";

interface Identifiable {
  id: string;
}

interface PersonLike extends Identifiable {
  name: string;
}

interface EvidenceLike extends Identifiable {
  personIds?: string[];
}

export const findEvidenceById = (id: string) =>
  state.allEvidence.find((item: Identifiable) => item.id === id) || null;

export const findPersonById = (id: string) =>
  state.allPeople.find((item: Identifiable) => item.id === id) || null;

export const findLocationById = (id: string) =>
  state.allLocations.find((item: Identifiable) => item.id === id) || null;

export const evidenceMentionsPerson = (ev: EvidenceLike, person: PersonLike): boolean => {
  if (!ev.personIds) return false;
  return (
    ev.personIds.indexOf(person.id) !== -1 ||
    ev.personIds.indexOf(person.name) !== -1
  );
};

export const formatDate = (ts: string | null | undefined): string => {
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

export const getStatusBadgeClass = (status: string | null | undefined): string => {
  const s = (status || "").toLowerCase();
  if (s === "reviewed") return "badge-reviewed";
  if (s === "flagged") return "badge-flagged";
  return "badge-unreviewed";
};

export const getRelevanceBadgeClass = (relevance: string | null | undefined): string => {
  const r = (relevance || "").toLowerCase();
  if (r === "relevant") return "badge-relevant";
  return "badge-unreviewed";
};

export const escapeHtml = (value: unknown): string => {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
};