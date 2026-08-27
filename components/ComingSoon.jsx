"use client";

// Wraps a not-yet-live card: desaturated and non-interactive by default,
// full colour on hover. `fill` makes it stretch like a flex:1 card.
export default function ComingSoon({ children, fill = false }) {
  return (
    <div className={fill ? "coming-soon coming-soon--fill" : "coming-soon"}>
      <div className="coming-soon__inner">{children}</div>
    </div>
  );
}
