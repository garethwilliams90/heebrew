export function ProgressMeter({
  label,
  value,
  max,
  ratio,
  sections,
  className,
  pace = "glide",
  barClassName = "bg-emerald-700",
}: {
  label: string;
  value: number;
  max: number;
  ratio: number;
  sections?: number;
  className?: string;
  pace?: "glide" | "tick";
  barClassName?: string;
}) {
  const marks = sections && sections > 0 ? Math.round(sections) : 0;

  return (
    <div
      className={`relative ${className ?? "h-1.5 rounded-full bg-emerald-950/10"}`}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className="h-full overflow-hidden rounded-full bg-emerald-950/10">
        <div
          className={`h-full rounded-full ${barClassName} ${
            pace === "tick" ? "transition-[width] duration-100 ease-linear" : "transition-[width] duration-500"
          }`}
          style={{ width: `${ratio}%` }}
        />
      </div>
      {marks > 0
        ? Array.from({ length: marks }, (_, index) => (
            <span
              key={index}
              aria-hidden
              className="pointer-events-none absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 ring-2 ring-[#f3f6f1]"
              style={{ left: `${((index + 0.5) / marks) * 100}%` }}
            />
          ))
        : null}
    </div>
  );
}
