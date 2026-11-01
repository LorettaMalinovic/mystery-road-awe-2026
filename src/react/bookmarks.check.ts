import { toggleBookmark } from "./bookmarks";

const check = (name: string, ok: boolean): void => {
  if (!ok) throw new Error("FAILED: " + name);
  console.log("ok: " + name);
};

const before: readonly string[] = ["E1"];
const added = toggleBookmark(before, "E2");
const removed = toggleBookmark(added, "E2");

check("toggle on returns a NEW array", added !== before);
check("old array is unchanged", before.length === 1 && before[0] === "E1");
check("new array has the id", added.includes("E2") && added.length === 2);
check("toggle off returns a NEW array", removed !== added);
check("old array still has the id", added.length === 2);
check("toggle off removed it", !removed.includes("E2"));
