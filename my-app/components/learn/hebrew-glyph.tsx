import type { HTMLAttributes, ReactNode } from "react";
import { printFont } from "@/components/alephbet/print-font";
import { cn } from "cn";

export function HebrewGlyph({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn(printFont.className, "text-black", className)} dir="rtl" lang="he" {...rest}>
      {children}
    </span>
  );
}
