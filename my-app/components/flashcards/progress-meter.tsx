export function ProgressMeter({
  label,
  value,
  max,
  ratio,
  sections,
  className,
}: {
  label: string;
  value: number;
  max: number;
  ratio: number;
  sections?: number;
  className?: string;
}) {
  const marks = sections && sections > 0 ? Math.round(sections) : 0;

  return (
    <div
      className={`relative ${className ?? "h-1.5 overflow-hidden rounded-full bg-emerald-950/10"}`}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className="h-full overflow-hidden rounded-full bg-emerald-950/10">
        <div
          className="h-full rounded-full bg-emerald-700 transition-[width] duration-500"
          style={{ width: `${ratio}%` }}
        />
      </div>
      {marks > 0
        ? Array.from({ length: marks }, (_, index) => {
            const last = index + 1 === marks;
            return (
              <span
                key={index}
                aria-hidden
                className="absolute top-1/2 size-2.5 rounded-full bg-blue-500 ring-2 ring-[#f3f6f1]"
                style={{
                  left: `${((index + 1) / marks) * 100}%`,
                  transform: last ? "translate(-100%, -50%)" : "translate(-50%, -50%)",
                }}
              />
            );
          })
        : null}
    </div>
  );
}
