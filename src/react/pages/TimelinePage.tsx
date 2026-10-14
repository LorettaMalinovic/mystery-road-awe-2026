import type { CaseFile } from "../useCaseData";
import { TimelineList } from "../components/TimelineList";

interface TimelinePageProps {
  data: CaseFile;
}

export const TimelinePage = ({ data }: TimelinePageProps) => {
  const sorted = [...data.timeline].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );

  return (
    <section className="view active">
      <h2>Investigation Timeline</h2>
      <TimelineList events={sorted} />
    </section>
  );
};
