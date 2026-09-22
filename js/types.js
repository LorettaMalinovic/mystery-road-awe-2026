

export interface Evidence {
  id: string;
  title: string;
  type: string;
  summary: string;
  content: string;
  timestamp: string;
  personIds: string[];
  locationIds: string[];
  tags: string[];
  status: "unreviewed" | "reviewed" | "flagged";
  relevance: "unknown" | "relevant" | "irrelevant";
  bookmarked?: boolean; // set client-side after loading, not present in raw JSON
}

export interface Person {
  id: string;
  name: string;
  role: string;
  speciality: string;
  avatar: string;
  responsibilities: string[];
  statement: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  contains: string[];
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: string;
  personIds: string[];
  locationIds: string[];
  evidenceIds: string[];
  certainty: "confirmed" | "reported" | "contradictory" | "unclear";
}

export interface CaseData {
  title: string;
  status: string;
  summary: string;
}