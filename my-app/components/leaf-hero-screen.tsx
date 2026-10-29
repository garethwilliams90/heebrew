import type { ReactNode } from "react";
import { AlephMark } from "@/components/brand/aleph-mark";

export function LeafHeroScreen({
  title,
  body,
  before,
  children,
  actions,
  as: Tag = "section",
  className = "flex flex-1 flex-col items-center justify-center text-center",
  bodyClassName = "mt-3 max-w-sm text-emerald-900/70",
}: {
  title: string;
  body?: ReactNode;
  before?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  as?: "section" | "main";
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Tag className={className}>
      {before}
      <AlephMark className="mb-4 size-12 text-emerald-800" />
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{title}</h1>
      {body ? <p className={bodyClassName}>{body}</p> : null}
      {children}
      {actions ? <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </Tag>
  );
}
