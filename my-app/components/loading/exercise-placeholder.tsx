import { Skeleton } from "@/components/ui/skeleton";

export function ExercisePlaceholder() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4" aria-hidden>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full rounded-3xl" />
      <div className="grid w-full gap-3 sm:grid-cols-2">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    </div>
  );
}
