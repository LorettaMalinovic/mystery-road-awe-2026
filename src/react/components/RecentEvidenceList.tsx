import type { Evidence } from "../../../js/types";
import { statusBadgeClass } from "../format";

interface RecentEvidenceListProps {
  items: Evidence[];
}

export const RecentEvidenceList = ({ items }: RecentEvidenceListProps) => (
  <div className="dashboard-panel">
    <h3>Recent evidence</h3>
    {items.length === 0 && <p>No evidence loaded yet.</p>}
    {items.map((ev) => (
      <div className="mini-list-item" key={ev.id}>
        <strong>{ev.id}</strong> — {ev.title}{" "}
        <span className={`badge ${statusBadgeClass(ev.status)}`}>{ev.status}</span>
      </div>
    ))}
  </div>
);