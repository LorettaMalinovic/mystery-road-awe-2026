import type { TimelineEvent } from "../../../js/types";
import { formatDate } from "../format";
import { Card } from "./Card";
import { CertaintyBadge } from "./CertaintyBadge";

interface TimelineEventItemProps {
  event: TimelineEvent;
}

export const TimelineEventItem = ({ event }: TimelineEventItemProps) => (
  <Card className={`timeline-event certainty-${event.certainty}`}>
    <div className="timeline-time">
      {formatDate(event.time)}&nbsp;&middot;&nbsp;
      <CertaintyBadge certainty={event.certainty} />
    </div>
    <h3>{event.title}</h3>
    <p>{event.description}</p>
  </Card>
);
