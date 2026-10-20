export function PointedLetter({ letter, mark = "", tail = "" }: { letter: string; mark?: string; tail?: string }) {
  if (!mark && !tail) {
    return letter;
  }

  return (
    <span className="inline-flex items-end">
      <span className="inline-grid">
        <span className="col-start-1 row-start-1 text-blue-600" aria-hidden>
          {letter}
          {mark}
        </span>
        <span className="relative z-10 col-start-1 row-start-1 text-black">{letter}</span>
      </span>
      {tail ? (
        <span className="text-blue-600" aria-hidden>
          {tail}
        </span>
      ) : null}
    </span>
  );
}
