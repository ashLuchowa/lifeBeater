"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDashboardData } from "./DashboardData";

// Cross-fades between days: the outgoing day (a frozen HTML snapshot) slides out
// and fades while the incoming day slides in from the opposite side.
export default function DayTransition({ children }) {
  const { selectedWeek, direction } = useDashboardData();
  const liveRef = useRef(null);
  const prevToken = useRef(selectedWeek);
  const pending = useRef(null);
  const seq = useRef(0);
  const [ghost, setGhost] = useState(null);

  // Detect the change during render — before React commits the new DOM — so the
  // snapshot we grab is still the previous day's markup.
  if (prevToken.current !== selectedWeek) {
    const firstMount = prevToken.current === "";
    pending.current =
      firstMount || !liveRef.current
        ? null
        : { html: liveRef.current.innerHTML, dir: direction };
    prevToken.current = selectedWeek;
  }

  useLayoutEffect(() => {
    if (pending.current) {
      setGhost({ ...pending.current, id: ++seq.current });
      pending.current = null;
    }
  });

  useEffect(() => {
    if (!ghost) return;
    const t = setTimeout(() => setGhost(null), 340);
    return () => clearTimeout(t);
  }, [ghost]);

  return (
    <div className="day-transition">
      {ghost && (
        <div
          key={ghost.id}
          className={`day-layer day-layer--out-${ghost.dir > 0 ? "fwd" : "back"}`}
          dangerouslySetInnerHTML={{ __html: ghost.html }}
        />
      )}
      <div
        ref={liveRef}
        key={selectedWeek}
        className={`day-layer day-layer--in-${direction > 0 ? "fwd" : "back"}`}
      >
        {children}
      </div>
    </div>
  );
}
