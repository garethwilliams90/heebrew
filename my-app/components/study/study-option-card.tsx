export function StudyOptionCard({
  name,
  value,
  selected,
  disabled,
  title,
  hint,
  countLabel,
  onSelect,
}: {
  name: string;
  value?: string;
  selected: boolean;
  disabled?: boolean;
  title: string;
  hint: string;
  countLabel?: string;
  onSelect: () => void;
}) {
  return (
    <label
      className={`rounded-3xl border px-4 py-4 ${
        disabled
          ? "cursor-not-allowed border-emerald-950/10 bg-white/50 opacity-60"
          : selected
            ? "cursor-pointer border-emerald-700 bg-white shadow-[0_16px_40px_-28px_rgba(6,78,59,0.6)]"
            : "cursor-pointer border-emerald-950/10 bg-white/80"
      }`}
    >
      <input
        type="radio"
        name={name}
        className="sr-only"
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={onSelect}
      />
      <span className="block font-medium">{title}</span>
      <span className="mt-1 block text-sm text-emerald-900/70">{hint}</span>
      {countLabel ? <span className="mt-2 block text-sm text-emerald-800">{countLabel}</span> : null}
    </label>
  );
}
