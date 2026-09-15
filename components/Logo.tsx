export function DaimoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="daimo-mark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#394e9d" />
          <stop offset="55%" stopColor="#3fb5cc" />
          <stop offset="100%" stopColor="#65b22e" />
        </linearGradient>
      </defs>
      <path d="M20 8 L20 46 L52 27 Z" fill="url(#daimo-mark-gradient)" />
      <path d="M20 46 L20 92 L88 46 Z" fill="url(#daimo-mark-gradient)" />
    </svg>
  );
}
