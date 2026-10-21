export function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="60" height="60" rx="16" fill="var(--logo-bg)" stroke="var(--gold)" strokeWidth="2" />
      <path d="M14 32 L32 18 L50 32 V50 H14 Z" fill="var(--gold)" />
      <rect x="27" y="36" width="10" height="14" rx="2" fill="var(--logo-bg)" />
      <rect x="40" y="26" width="4" height="12" rx="1.5" fill="var(--teal)" />
      <circle cx="44" cy="26" r="3" fill="var(--teal)" />
    </svg>
  );
}
