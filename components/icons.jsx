const strokeProps = {
  fill: "none",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function MenuIcon({ size = 16, color = "#14150f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function HomeIcon({ size = 15, color = "#14150f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <path d="M4 11l8-7 8 7v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export function LedgerIcon({ size = 15, color = "#14150f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <path d="M4 7h16M4 12h16M4 17h9" />
      <path d="M18 15v4M16 17h4" />
    </svg>
  );
}

export function BarsIcon({ size = 15, color = "#14150f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <path d="M7 17V9M12 17v-5M17 17v-9" />
      <path d="M4 20h16" />
    </svg>
  );
}

export function SearchIcon({ size = 14, color = "#14150f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 20, color = "#14150f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 20, color = "#14150f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function DotsIcon({ size = 13, color = "#14150f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="6" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="18" r="1.6" />
    </svg>
  );
}

export function PencilIcon({ size = 13, color = "#14150f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

export function PlusIcon({ size = 13, color = "#14150f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function LogOutIcon({ size = 14, color = "#14150f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function RepeatIcon({ size = 12, color = "#14150f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function CheckIcon({ size = 9, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
