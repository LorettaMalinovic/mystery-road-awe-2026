import type { Evidence, Person } from "../../../js/types";
import type { CaseFile } from "../useCaseData";
import { PersonCard } from "../components/PersonCard";
import { LocationCard } from "../components/LocationCard";

interface PeoplePageProps {
  data: CaseFile;
}

// The data mixes person ids and one display name in personIds, so we check both.
const countEvidence = (evidence: Evidence[], person: Person): number =>
  evidence.filter((ev) => ev.personIds.includes(person.id) || ev.personIds.includes(person.name))
    .length;

export const PeoplePage = ({ data }: PeoplePageProps) => (
  <section className="view active">
    <h2>People &amp; Locations</h2>

    <h3>People</h3>
    <div className="people-grid">
      {data.people.map((person) => (
        <PersonCard
          key={person.id}
          person={person}
          evidenceCount={countEvidence(data.evidence, person)}
        />
      ))}
    </div>

    <h3>Locations</h3>
    <div className="locations-grid">
      {data.locations.map((location) => (
        <LocationCard key={location.id} location={location} />
      ))}
    </div>
  </section>
);
