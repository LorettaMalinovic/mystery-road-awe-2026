interface StatCardProps {
  value: number;
  label: string;
}

export const StatCard = ({ value, label }: StatCardProps) => (
  <div className="stat-card">
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);