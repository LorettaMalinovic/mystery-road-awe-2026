import { useEffect, useState } from "react";

interface TickerProps {
  withCleanup: boolean;
}

const Ticker = ({ withCleanup }: TickerProps) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    console.log("effect: start timer");
    const id = window.setInterval(() => {
      console.log("tick");
      setSeconds((s) => s + 1);
    }, 1000);

    if (!withCleanup) {
      return; // forgot the cleanup on purpose
    }
    return () => {
      console.log("cleanup: stop timer");
      window.clearInterval(id);
    };
  }, [withCleanup]);

  return <p>Seconds: {seconds}</p>;
};

export const CleanupDemo = () => {
  const [show, setShow] = useState(true);
  const [withCleanup, setWithCleanup] = useState(true);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={withCleanup}
          onChange={(e) => setWithCleanup(e.target.checked)}
        />{" "}
        use cleanup function
      </label>{" "}
      <button type="button" onClick={() => setShow(!show)}>
        {show ? "Unmount ticker" : "Mount ticker"}
      </button>
      {show && <Ticker key={String(withCleanup)} withCleanup={withCleanup} />}
    </div>
  );
};
