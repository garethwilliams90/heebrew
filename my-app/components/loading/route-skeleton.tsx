import { Skeleton } from "@/components/ui/skeleton";

export type RouteSkeletonKind = "page" | "path" | "study" | "profile" | "form";

export function RouteSkeleton({ kind = "page", label }: { kind?: RouteSkeletonKind; label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label={label} className="flex w-full flex-1 flex-col">
      {label ? <span className="sr-only">{label}</span> : null}
      {kind === "path" ? <PathSkeleton /> : null}
      {kind === "study" ? <StudySkeleton /> : null}
      {kind === "profile" ? <ProfileSkeleton /> : null}
      {kind === "form" ? <FormSkeleton /> : null}
      {kind === "page" ? <PageSkeleton /> : null}
    </div>
  );
}

function PathSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-6 py-4" aria-hidden>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="size-16 rounded-2xl" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="size-20 rounded-2xl" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="size-16 rounded-2xl" />
    </div>
  );
}

function StudySkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-6 px-4 py-8" aria-hidden>
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-56 w-full rounded-3xl" />
      <div className="grid w-full gap-3 sm:grid-cols-2">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4" aria-hidden>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-36 rounded-3xl" />
        <Skeleton className="h-36 rounded-3xl" />
      </div>
      <Skeleton className="h-72 rounded-3xl" />
      <Skeleton className="h-28 rounded-3xl" />
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center p-6" aria-hidden>
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8" aria-hidden>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-5 w-72 max-w-full" />
      <Skeleton className="h-28 w-full rounded-3xl" />
      <Skeleton className="h-28 w-full rounded-3xl" />
      <Skeleton className="h-28 w-full rounded-3xl" />
    </div>
  );
}
