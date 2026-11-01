import type { Person } from "../../../js/types";
import { Card } from "./Card";
import { EvidenceCount } from "./EvidenceCount";

interface PersonCardProps {
  person: Person;
  evidenceCount: number;
}

export const PersonCard = ({ person, evidenceCount }: PersonCardProps) => (
  <Card className="person-card">
    <div className="person-card-header">
      <img className="person-avatar" src={person.avatar} alt={`Portrait of ${person.name}`} />
      <div>
        <h3>{person.name}</h3>
        <div className="person-role">{person.role}</div>
      </div>
    </div>
    <p>
      <strong>Speciality:</strong> {person.speciality}
    </p>
    <ul>
      {person.responsibilities.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
    <div className="person-statement">&ldquo;{person.statement}&rdquo;</div>
    <EvidenceCount count={evidenceCount} />
  </Card>
);

