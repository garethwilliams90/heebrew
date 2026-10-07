import { Leaf } from "lucide-react";

export function ProgramLoader({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16" role="status" aria-live="polite">
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-800" />
        <Leaf className="size-6 text-emerald-800" aria-hidden />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
