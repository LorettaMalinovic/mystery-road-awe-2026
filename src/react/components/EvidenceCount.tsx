interface EvidenceCountProps {
  count: number;
}

export const EvidenceCount = ({ count }: EvidenceCountProps) => (
  <p>
    {count} related evidence {count === 1 ? "item" : "items"}
  </p>
);
