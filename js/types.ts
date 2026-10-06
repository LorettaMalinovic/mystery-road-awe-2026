export type EvidenceStatus = "unreviewed" | "reviewed" | "flagged";
export type EvidenceRelevance = "unknown" | "relevant" | "irrelevant";
export type Certainty = "confirmed" | "reported" | "contradictory" | "unclear";

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
  status: EvidenceStatus;
  relevance: EvidenceRelevance;
  bookmarked?: boolean; // wird erst im Browser gesetzt, nicht im JSON
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
  certainty: Certainty;
}

export interface CaseData {
  title: string;
  status: string;
  summary: string;
}