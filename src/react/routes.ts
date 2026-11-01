export const VIEWS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "evidence", label: "Evidence" },
  { id: "people", label: "People & Locations" },
  { id: "timeline", label: "Timeline" },
  { id: "workspace", label: "Workspace" },
] as const;

export type ViewId = (typeof VIEWS)[number]["id"];

export const isViewId = (value: string): value is ViewId =>
  VIEWS.some((view) => view.id === value);
