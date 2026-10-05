export function TrainingChoice({
  number,
  words,
  answered,
  correct,
  selected,
  onChoose,
}: {
  number: number;
  words: string[];
  answered: boolean;
  correct: boolean;
  selected: boolean;
  onChoose: () => void;
}) {
  const tone = !answered
    ? "border-emerald-900 bg-white hover:bg-emerald-50"
    : correct
      ? "border-emerald-700 bg-emerald-50"
      : selected
        ? "border-red-700 bg-red-50"
        : "border-emerald-900/20 bg-white opacity-60";

  return (
    <button
      type="button"
      dir="rtl"
      lang="he"
      disabled={answered}
      onClick={onChoose}
      className={`flex min-h-16 items-center gap-3 rounded-2xl border-2 px-5 py-4 text-xl transition-colors disabled:cursor-default ${tone}`}
    >
      <span dir="ltr" className="shrink-0 tabular-nums">
        {number}.
      </span>
      <span>{words.join(", ")}</span>
    </button>
  );
}
