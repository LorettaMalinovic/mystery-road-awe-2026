import { useEffect, useState } from "react";

// ---------- BAD: side effects directly in render ----------
let renderCount = 0; // lives OUTSIDE the component

export const RenderSideEffectBad = () => {
  renderCount += 1; // side effect 1: changes a variable outside the component
  console.log("render number", renderCount); // side effect 2: output on every render
  localStorage.setItem("remotion_demo_renders", String(renderCount)); // side effect 3: writes storage
  return <p>BAD: this render function ran {renderCount} times for 1 screen.</p>;
};

// ---------- GOOD: same idea, effect in the right place ----------
export const RenderSideEffectGood = () => {
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    localStorage.setItem("remotion_demo_clicks", String(clicks)); // after render, in an effect
  }, [clicks]);

  return (
    <button type="button" onClick={() => setClicks(clicks + 1)}>
      GOOD: clicked {clicks} times
    </button>
  );
};

export const RenderSideEffect = () => (
  <>
    <RenderSideEffectBad />
    <RenderSideEffectGood />
  </>
);
