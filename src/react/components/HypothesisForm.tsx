import type { Evidence, Person } from "../../../js/types";

interface HypothesisFormProps {
  people: Person[];
  evidence: Evidence[];
}

export const HypothesisForm = ({ people, evidence }: HypothesisFormProps) => (
  <div className="hypothesis-card">
    <h3>Hypothesis Draft</h3>
    <form>
      <div className="form-row">
        <label htmlFor="hypSuspect">Suspected responsible person</label>
        <select id="hypSuspect">
          <option value="">Select a person...</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="hypNature">Accidental or deliberate incident</label>
        <select id="hypNature">
          <option value="">Select...</option>
          <option value="accidental">Accidental</option>
          <option value="deliberate">Deliberate</option>
          <option value="unclear">Unclear</option>
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="hypEvidence">Selected supporting evidence</label>
        <select id="hypEvidence" multiple size={6}>
          {evidence.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.id} - {ev.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="hypConfidence">Confidence (0&ndash;100)</label>
        <input type="range" id="hypConfidence" min={0} max={100} defaultValue={50} />
        <output id="hypConfidenceValue">50</output>
      </div>

      <div className="form-row">
        <label htmlFor="hypExplanation">Written explanation</label>
        <textarea id="hypExplanation" rows={4} placeholder="Explain your reasoning..." />
      </div>

      <div className="form-row">
        <label htmlFor="hypAlternative">Alternative explanation</label>
        <textarea
          id="hypAlternative"
          rows={3}
          placeholder="What else could explain the evidence?"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-primary">
          Save hypothesis draft
        </button>
      </div>
    </form>
  </div>
);
