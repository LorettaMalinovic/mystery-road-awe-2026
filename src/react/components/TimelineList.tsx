import type { TimelineEvent } from "../../../js/types";
import { TimelineEventItem } from "./TimelineEventItem";

interface TimelineListProps {
  events: TimelineEvent[];
}

export const TimelineList = ({ events }: TimelineListProps) => {
  if (events.length === 0) {
    return <p>No timeline events match.</p>;
  }

  return (
    <div className="timeline-container">
      {events.map((event) => (
        <TimelineEventItem key={event.id} event={event} />
      ))}
    </div>
  );
};
