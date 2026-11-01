import { useState } from "react";
import type { Evidence } from "../../../js/types";
import { formatDate, relevanceBadgeClass, statusBadgeClass } from "../format";
import { Card } from "./Card";

interface EvidenceCardProps {
  evidence: Evidence;
  isBookmarked: boolean;
  savedNote: string;
  onToggleBookmark: (id: string) => void;
  onSaveNote: (id: string, text: string) => void;
}

export const EvidenceCard = ({
  evidence,
  isBookmarked,
  savedNote,
  onToggleBookmark,
  onSaveNote,
}: EvidenceCardProps) => {
  // the text being typed is local UI state, only the saved note lives in App
  const [draft, setDraft] = useState(savedNote);

  return (
    <Card className="evidence-card">
      <button
        type="button"
        className={isBookmarked ? "bookmark-btn active" : "bookmark-btn"}
        aria-label={`Toggle bookmark for ${evidence.title}`}
        onClick={() => onToggleBookmark(evidence.id)}
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
      <div className="note-editor">
        <label htmlFor={`note-${evidence.id}`}>Note</label>
        <textarea
          id={`note-${evidence.id}`}
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a note..."
        />
        <button
          type="button"
          className="btn btn-small btn-secondary"
          onClick={() => onSaveNote(evidence.id, draft)}
        >
          Save note
        </button>
      </div>
    </Card>
  );
};
