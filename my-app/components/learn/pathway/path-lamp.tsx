import { cn } from "cn";

// Kitbitz medieval-kit, CC0. The arm of each lamp reaches back toward the stones.
const sources = {
  lantern: {
    left: "/kitbitz/lantern-right.svg",
    right: "/kitbitz/lantern-left.svg",
  },
  torch: {
    left: "/kitbitz/torch-right.svg",
    right: "/kitbitz/torch-left.svg",
  },
} as const;

export function PathLamp({
  side,
  kind,
  delay,
}: {
  side: "left" | "right";
  kind: "lantern" | "torch";
  delay: number;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute bottom-0 z-20 hidden dark:block",
        side === "left" ? "-left-16" : "-right-16",
      )}
    >
      <span
        className={cn(
          "path-lamp-glow absolute -top-6 size-48",
          side === "left" ? "left-2" : "right-2",
        )}
        style={{ animationDelay: `${delay}s` }}
      />
      {/* Decorative SVGs. The image optimizer does not resize these. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sources[kind][side]}
        alt=""
        width={kind === "torch" ? 135 : 273}
        height={kind === "torch" ? 541 : 488}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cn("relative w-auto max-w-none", kind === "torch" ? "h-36" : "h-32")}
      />
    </span>
  );
}
