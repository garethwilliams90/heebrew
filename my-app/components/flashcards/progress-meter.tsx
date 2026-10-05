export function ProgressMeter({
  label,
  value,
  max,
  ratio,
  className,
}: {
  label: string;
  value: number;
  max: number;
  ratio: number;
  className?: string;
}) {
  return (
    <div
      className={className ?? "h-1.5 overflow-hidden rounded-full bg-emerald-950/10"}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div
        className="h-full rounded-full bg-emerald-700 transition-[width] duration-500"
        style={{ width: `${ratio}%` }}
      />
    </div>
  );
}
