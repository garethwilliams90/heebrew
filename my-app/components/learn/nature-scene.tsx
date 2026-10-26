export function NatureScene() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden text-emerald-800/35 transition-opacity duration-300 dark:opacity-40 dark:brightness-75 dark:saturate-50">
      <Tree className="absolute top-16 left-[8%] w-24" />
      <Tree className="absolute top-28 right-[12%] w-16 opacity-70" />
      <Bush className="absolute bottom-24 left-[18%] w-20" />
      <Bush className="absolute top-40 right-[22%] w-14" />
      <Boulder className="absolute bottom-16 left-[6%] w-16" />
      <Boulder className="absolute top-24 right-[6%] w-12" />
      <Log className="absolute bottom-28 right-[18%] w-24" />
      <Mushroom className="absolute bottom-20 left-[32%] w-8" />
      <Mushroom className="absolute top-48 left-[22%] w-6" />
    </div>
  );
}

export function StonePath({ turn }: { turn: number }) {
  return (
    <svg aria-hidden viewBox="0 0 88 32" className="h-8 w-24 text-stone-500/70" style={{ transform: `rotate(${turn}deg)` }}>
      <ellipse cx="16" cy="18" rx="14" ry="7" fill="currentColor" />
      <ellipse cx="44" cy="14" rx="16" ry="8" fill="currentColor" opacity="0.8" />
      <ellipse cx="70" cy="20" rx="12" ry="6" fill="currentColor" opacity="0.65" />
    </svg>
  );
}

function Tree({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 110" className={className}>
      <rect x="36" y="62" width="8" height="36" rx="2" fill="#8a5a32" />
      <circle cx="40" cy="42" r="28" fill="#3f8f55" />
      <circle cx="24" cy="52" r="16" fill="#4ea164" />
      <circle cx="56" cy="50" r="16" fill="#2f7a45" />
    </svg>
  );
}

function Bush({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 48" className={className}>
      <ellipse cx="24" cy="28" rx="20" ry="14" fill="#5aaa62" />
      <ellipse cx="48" cy="24" rx="24" ry="16" fill="#3d8d4c" />
      <ellipse cx="62" cy="30" rx="14" ry="10" fill="#6db872" />
    </svg>
  );
}

function Boulder({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 52" className={className}>
      <ellipse cx="40" cy="32" rx="34" ry="16" fill="#b7b1a4" />
      <path d="M12 32c4-16 18-24 32-20 10 3 20 12 24 20" fill="#9c9588" />
    </svg>
  );
}

function Log({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 36" className={className}>
      <rect x="8" y="10" width="84" height="16" rx="8" fill="#8d5b34" />
      <circle cx="14" cy="18" r="8" fill="#c4a074" />
      <circle cx="14" cy="18" r="3" fill="#6b4224" />
    </svg>
  );
}

function Mushroom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect x="17" y="18" width="6" height="14" rx="2" fill="#f3efe4" />
      <path d="M4 22c2-12 10-16 16-16s14 4 16 16z" fill="#c4524a" />
      <circle cx="14" cy="16" r="2" fill="#f6efe6" />
      <circle cx="24" cy="14" r="1.6" fill="#f6efe6" />
    </svg>
  );
}
