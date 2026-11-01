import type { CaseFile } from "../useCaseData";
import { StatCard } from "../components/StatCard";
import { ReviewProgress } from "../components/ReviewProgress";
import { RecentEvidenceList } from "../components/RecentEvidenceList";
import { RecentTimelineList } from "../components/RecentTimelineList";

interface DashboardPageProps {
  data: CaseFile;
  bookmarkedIds: readonly string[];
}

export const DashboardPage = ({ data, bookmarkedIds }: DashboardPageProps) => {
  const { caseData, evidence, people, locations, timeline } = data;

  // derived values: calculated on every render, no render-cache flag, no second copy in storage
  const bookmarkCount = bookmarkedIds.length;
  const reviewedCount = evidence.filter((e) => e.status.toLowerCase() === "reviewed").length;
  const progressPct =
    evidence.length === 0 ? 0 : Math.round((reviewedCount / evidence.length) * 100);

  return (
    <section className="view active">
      <h2>Case Dashboard</h2>

      <div className="case-summary-card">
        <h3>{caseData.title}</h3>
        <p>
          <span className="badge badge-flagged">{caseData.status.toUpperCase()}</span>
        </p>
        <p>{caseData.summary}</p>
      </div>

      <div className="stat-grid">
        <StatCard value={evidence.length} label="Evidence items" />
        <StatCard value={people.length} label="People" />
        <StatCard value={locations.length} label="Locations" />
        <StatCard value={bookmarkCount} label="Bookmarked" />
        <StatCard value={reviewedCount} label="Reviewed" />
      </div>

      <ReviewProgress percent={progressPct} />

      <div className="dashboard-columns">
        <RecentEvidenceList items={evidence.slice(-5).reverse()} />
        <RecentTimelineList items={timeline.slice(-5).reverse()} />
      </div>
    </section>
  );
};
