"use client";

import type { ReactNode } from "react";
import { DevLevelControl } from "@/components/learn/dev-level";
import { LevelClose } from "@/components/learn/level-finish";
import { NikudInfo } from "./nikud-info";

export function LevelFrame({
  label,
  finished,
  children,
  aside,
  corner,
  footer,
}: {
  label: string;
  finished: boolean;
  children: ReactNode;
  aside?: ReactNode;
  corner?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-[2rem] bg-white/55 p-4 shadow-[0_24px_60px_-36px_rgba(6,78,59,0.45)] backdrop-blur-md">
      <header className="relative flex shrink-0 items-center justify-between py-1">
        <NikudInfo />
        <p className="rounded-full border border-emerald-700/60 bg-white/80 px-4 py-1 text-sm font-semibold tracking-[0.18em] text-emerald-950 uppercase">
          {label}
        </p>
        <LevelClose finished={finished} className="z-20" />
      </header>
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {corner ? <div className="z-20 flex shrink-0 justify-start pb-1">{corner}</div> : null}
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-hidden">{children}</div>
        </div>
        {aside}
      </div>
      {footer}
      <DevLevelControl />
    </main>
  );
}
