export function BlankSentence({
  template,
  blankLabel,
}: {
  template: string;
  blankLabel: string;
}) {
  const parts = template.split("{}");

  return (
    <p dir="rtl" lang="he" className="text-2xl leading-loose text-emerald-950 sm:text-3xl">
      {parts.map((part, partIndex) => (
        <span key={`${partIndex}-${part}`}>
          {part}
          {partIndex < parts.length - 1 ? (
            <span className="mx-1 inline-block min-w-16 border-b-2 border-emerald-900 align-middle">
              <span className="sr-only">{blankLabel}</span>
            </span>
          ) : null}
        </span>
      ))}
    </p>
  );
}
