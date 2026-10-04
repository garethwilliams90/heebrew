import type { ReactNode } from "react";

export function MarkedText({
  text,
  bold,
}: {
  text: string;
  bold?: [number, number][];
}) {
  if (!bold?.length) {
    return text;
  }

  const nodes: ReactNode[] = [];
  let cursor = 0;

  bold.forEach(([start, end], index) => {
    if (start > cursor) {
      nodes.push(text.slice(cursor, start));
    }

    nodes.push(
      <strong key={index} className="font-bold text-emerald-950">
        {text.slice(start, end)}
      </strong>,
    );
    cursor = end;
  });

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}
