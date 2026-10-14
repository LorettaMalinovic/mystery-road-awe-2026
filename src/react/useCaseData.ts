import { useEffect, useState } from "react";
import type { CaseData, Evidence, Person, Location, TimelineEvent } from "../../js/types";

export interface CaseFile {
  caseData: CaseData;
  evidence: Evidence[];
  people: Person[];
  locations: Location[];
  timeline: TimelineEvent[];
}

export type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CaseFile };

const readJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load " + url + " (" + res.status + ")");
  return (await res.json()) as T;
};

export const useCaseData = (): LoadState => {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false; // StrictMode runs effects twice in dev
    Promise.all([
      readJson<CaseData>("data/case.json"),
      readJson<Evidence[]>("data/evidence.json"),
      readJson<Person[]>("data/people.json"),
      readJson<Location[]>("data/locations.json"),
      readJson<TimelineEvent[]>("data/timeline.json"),
    ])
      .then(([caseData, evidence, people, locations, timeline]) => {
        if (!cancelled) {
          setState({ status: "ready", data: { caseData, evidence, people, locations, timeline } });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ status: "error", message: err instanceof Error ? err.message : String(err) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};