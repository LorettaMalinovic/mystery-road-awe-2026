import { useState, type FormEvent } from "react";
import type { Evidence, Person } from "../../../js/types";

export interface HypothesisDraft {
  suspect: string;
  nature: string;
  evidenceIds: string[];
  confidence: number;
  explanation: string;
  alternative: string;
}

const STORAGE_KEY = "remotion_hypothesis";

const emptyDraft: HypothesisDraft = {
  suspect: "",
  nature: "",
  evidenceIds: [],
  confidence: 50,
  explanation: "",
  alternative: "",
};

// Reads the saved draft once. Every field is checked, because localStorage can hold anything.
const loadDraft = (): HypothesisDraft => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (typeof parsed !== "object" || parsed === null) return emptyDraft;
    const o = parsed as Record<string, unknown>;
    const text = (value: unknown): string => (typeof value === "string" ? value : "");
    const ids = Array.isArray(o.evidenceIds)
      ? o.evidenceIds.filter((x): x is string => typeof x === "string")
      : [];
    const confidence = typeof o.confidence === "number" ? o.confidence : 50;
    return {
      suspect: text(o.suspect),
      nature: text(o.nature),
      evidenceIds: ids,
      confidence,
      explanation: text(o.explanation),
      alternative: text(o.alternative),
    };
  } catch {
    return emptyDraft;
  }
};

interface HypothesisFormProps {
  people: Person[];
  evidence: Evidence[];
}

export const HypothesisForm = ({ people, evidence }: HypothesisFormProps) => {
  // ONE object for the whole form: the six fields belong together, they are saved together
  // and loaded together. One generic update() replaces six setters.
  const [draft, setDraft] = useState<HypothesisDraft>(loadDraft);
  const [message, setMessage] = useState("");

  const update = <K extends keyof HypothesisDraft>(key: K, value: HypothesisDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value })); // new object, old one untouched
    setMessage("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setMessage("Draft saved.");
    } catch {
      setMessage("Could not save the draft (storage unavailable).");
    }
  };

  return (
    <div className="hypothesis-card">
      <h3>Hypothesis Draft</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="hypSuspect">Suspected responsible person</label>
          <select
            id="hypSuspect"
            value={draft.suspect}
            onChange={(e) => update("suspect", e.target.value)}
          >
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
          <select
            id="hypNature"
            value={draft.nature}
            onChange={(e) => update("nature", e.target.value)}
          >
            <option value="">Select...</option>
            <option value="accidental">Accidental</option>
            <option value="deliberate">Deliberate</option>
            <option value="unclear">Unclear</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypEvidence">Selected supporting evidence</label>
          <select
            id="hypEvidence"
            multiple
            size={6}
            value={draft.evidenceIds}
            onChange={(e) =>
              update(
                "evidenceIds",
                Array.from(e.target.selectedOptions, (option) => option.value),
              )
            }
          >
            {evidence.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.id} - {ev.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypConfidence">Confidence (0&ndash;100)</label>
          <input
            type="range"
            id="hypConfidence"
            min={0}
            max={100}
            value={draft.confidence}
            onChange={(e) => update("confidence", Number(e.target.value))}
          />
          <output id="hypConfidenceValue">{draft.confidence}</output>
        </div>

        <div className="form-row">
          <label htmlFor="hypExplanation">Written explanation</label>
          <textarea
            id="hypExplanation"
            rows={4}
            placeholder="Explain your reasoning..."
            value={draft.explanation}
            onChange={(e) => update("explanation", e.target.value)}
          />
        </div>

        <div className="form-row">
          <label htmlFor="hypAlternative">Alternative explanation</label>
          <textarea
            id="hypAlternative"
            rows={3}
            placeholder="What else could explain the evidence?"
            value={draft.alternative}
            onChange={(e) => update("alternative", e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save hypothesis draft
          </button>
          {message !== "" && <span className="hint-text"> {message}</span>}
        </div>
      </form>
    </div>
  );
};
