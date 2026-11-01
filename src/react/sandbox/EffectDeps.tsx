import { useEffect, useState } from "react";

export const EffectDeps = () => {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  useEffect(() => {
    console.log("A  []        -> after mount only");
  }, []);

  useEffect(() => {
    console.log("B  [count]   -> count is", count);
  }, [count]);

  useEffect(() => {
    console.log("C  no array  -> after EVERY render");
  });

  // BUG ON PURPOSE: uses count but does not list it
  useEffect(() => {
    console.log("D  []        -> uses count, but sees the OLD value:", count);
  }, []);

  return (
    <div>
      <p>
        count: {count} | other: {other}
      </p>
      <button type="button" onClick={() => setCount(count + 1)}>
        count + 1
      </button>{" "}
      <button type="button" onClick={() => setOther(other + 1)}>
        other + 1
      </button>
    </div>
  );
};
