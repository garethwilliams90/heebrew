"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "cn";

export function Fold({
  title,
  children,
  open,
  onToggle,
  className,
  titleClassName,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
  titleClassName?: string;
}) {
  const [internal, setInternal] = useState(false);
  const shown = open ?? internal;

  return (
    <div className={className ?? "mt-4 border-t border-emerald-950/10 pt-3"}>
      <button
        type="button"
        className={cn("flex w-full cursor-pointer items-center gap-2 text-left text-sm font-medium", titleClassName)}
        aria-expanded={shown}
        onClick={() => {
          const next = !shown;
          if (onToggle) {
            onToggle(next);
            return;
          }
          setInternal(next);
        }}
      >
        <ChevronRight aria-hidden className={cn("size-4 shrink-0 text-emerald-800 transition-transform", shown && "rotate-90")} />
        {title}
      </button>
      {shown ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
