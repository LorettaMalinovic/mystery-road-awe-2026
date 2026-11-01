import type { Evidence } from "../../../js/types";
import { formatDate, relevanceBadgeClass, statusBadgeClass } from "../format";
import { Card } from "./Card";

interface EvidenceCardProps {
  evidence: Evidence;
  isBookmarked: boolean;
}

export const EvidenceCard = ({ evidence, isBookmarked }: EvidenceCardProps) => (
  <Card className="evidence-card">
    <button
      type="button"
      className={isBookmarked ? "bookmark-btn active" : "bookmark-btn"}
      aria-label={`Toggle bookmark for ${evidence.title}`}
    >
      <span className="bookmark-icon">{isBookmarked ? "\u2605" : "\u2606"}</span>
    </button>
    <h3>{evidence.title}</h3>
    <div className="evidence-meta">
      {evidence.id} &middot; {evidence.type} &middot; {formatDate(evidence.timestamp)}
    </div>
    <div className="evidence-summary">{evidence.summary}</div>
    {evidence.tags.includes("critical") && <span className="badge badge-critical">Critical</span>}
    <span className={`badge ${statusBadgeClass(evidence.status)}`}>{evidence.status}</span>
    <span className={`badge ${relevanceBadgeClass(evidence.relevance)}`}>{evidence.relevance}</span>
    <div>
      {evidence.tags.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
        </span>
      ))}
    </div>
  </Card>
);
