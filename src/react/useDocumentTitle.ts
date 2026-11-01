import { useEffect } from "react";
import { VIEWS, type ViewId } from "./routes";

// Real effect: the browser tab title is OUTSIDE React's root div, so React cannot render it.
// We sync it to the current view AFTER each render in which the view changed.
export const useDocumentTitle = (view: ViewId): void => {
  useEffect(() => {
    const label = VIEWS.find((v) => v.id === view)?.label ?? "";
    document.title = `${label} - Project ReMotion`;
  }, [view]);
};
