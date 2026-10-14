import type { Location } from "../../../js/types";

interface LocationCardProps {
  location: Location;
}

export const LocationCard = ({ location }: LocationCardProps) => (
  <div className="location-card">
    <h3>
      {location.id} &mdash; {location.name}
    </h3>
    <p>{location.description}</p>
    <p>
      <strong>Contains:</strong>
    </p>
    <ul>
      {location.contains.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);
