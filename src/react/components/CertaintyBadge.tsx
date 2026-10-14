import type { Certainty } from "../../../js/types";

interface CertaintyBadgeProps {
  certainty: Certainty;
}

// Lookup table: every certainty value maps to one badge style.
const BADGE_VARIANT: Record<Certainty, string> = {
  confirmed: "reviewed",
  reported: "flagged",
  contradictory: "critical",
};

export const CertaintyBadge = ({ certainty }: CertaintyBadgeProps) => (
  <span className={`badge badge-${BADGE_VARIANT[certainty]}`}>{certainty}</span>
);
