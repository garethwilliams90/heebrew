"use client";

import type { ReactNode } from "react";
import { printFont } from "@/components/alephbet/print-font";
import { DevLevelControl } from "@/components/learn/dev-level";
import { LevelClose } from "@/components/learn/level-finish";
import { cn } from "cn";
import { NikudInfo } from "./nikud-info";

export function LevelFrame({
  label,
  finished,
  children,
  aside,
  corner,
  footer,
  accent = false,
}: {
  label: string;
  finished: boolean;
  children: ReactNode;
  aside?: ReactNode;
  corner?: ReactNode;
  footer?: ReactNode;
  accent?: boolean;
}) {
  const hebrew = /[\u0590-\u05FF]/.test(label);
  return (
    <main
      className={cn(
        "relative z-10 mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden backdrop-blur-md",
        accent
          ? "rounded-[3rem] border border-emerald-400/80 bg-emerald-50/80 p-5 shadow-[0_0_0_8px_rgba(16,185,129,0.16),0_0_48px_rgba(16,185,129,0.4)] sm:p-8"
          : "rounded-[2rem] bg-white/55 p-3 shadow-[0_24px_60px_-36px_rgba(6,78,59,0.45)] sm:p-4",
      )}
    >
      <header className="relative flex shrink-0 items-center justify-between gap-2 py-1">
        <NikudInfo />
        <p
          className={cn(
            "rounded-full border border-emerald-700/60 bg-white/80 px-4 py-1 font-semibold text-emerald-950",
            hebrew ? cn(printFont.className, "text-2xl leading-none") : accent ? "text-sm" : "text-sm tracking-[0.18em] uppercase",
          )}
          dir={hebrew ? "rtl" : undefined}
          lang={hebrew ? "he" : undefined}
        >
          {label}
        </p>
        <LevelClose finished={finished} className="z-20" />
      </header>
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {corner ? <div className="z-20 flex shrink-0 justify-start pb-1">{corner}</div> : null}
          <div className="relative min-h-0 flex-1 overflow-y-auto">
            <div className="flex min-h-full w-full flex-col items-center justify-center gap-4 py-2">{children}</div>
          </div>
        </div>
        {aside}
      </div>
      {footer}
      <DevLevelControl />
    </main>
  );
}
