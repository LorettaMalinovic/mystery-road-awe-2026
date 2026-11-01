import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RenderSideEffect } from "./RenderSideEffect";
import { EffectDeps } from "./EffectDeps";
import { CleanupDemo } from "./CleanupDemo";

const demo = window.location.hash.replace("#", "");

const content =
  demo === "render" ? (
    <RenderSideEffect />
  ) : demo === "deps" ? (
    <EffectDeps />
  ) : demo === "cleanup" ? (
    <CleanupDemo />
  ) : (
    <p>Open sandbox.html#render, sandbox.html#deps or sandbox.html#cleanup (then press F5).</p>
  );

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(<StrictMode>{content}</StrictMode>);
