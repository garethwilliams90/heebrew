import type { ReactNode } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export function HearTile({
  children,
  hearLabel,
  hearAriaLabel,
  onHear,
  className,
}: {
  children: ReactNode;
  hearLabel?: string;
  hearAriaLabel?: string;
  onHear?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 rounded-3xl bg-white/80 px-4 py-3 shadow-sm", className)}>
      {children}
      {onHear && hearLabel ? (
        <Button type="button" variant="outline" className="h-10 px-4" sound={false} aria-label={hearAriaLabel} onClick={onHear}>
          <Volume2 /> {hearLabel}
        </Button>
      ) : null}
    </div>
  );
}
