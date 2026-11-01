import { useEffect, useState } from "react";
import { isViewId, type ViewId } from "./routes";

const readView = (): ViewId => {
  const hash = window.location.hash.replace("#", "");
  return isViewId(hash) ? hash : "dashboard"; // same fallback as the vanilla app
};

export const useHashView = (): ViewId => {
  const [view, setView] = useState<ViewId>(readView);

  useEffect(() => {
    const onHashChange = () => setView(readView());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return view;
};
