import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md border border-foreground/20 bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
