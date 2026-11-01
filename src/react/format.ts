export const formatDate = (ts: string): string => {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return (
    d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
};

export const statusBadgeClass = (status: string): string => {
  const s = status.toLowerCase();
  if (s === "reviewed") return "badge-reviewed";
  if (s === "flagged") return "badge-flagged";
  return "badge-unreviewed";
};
export const relevanceBadgeClass = (relevance: string): string =>
  relevance.toLowerCase() === "relevant" ? "badge-relevant" : "badge-unreviewed";
