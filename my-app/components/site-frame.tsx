import { Leaf } from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { Link } from "@/i18n/navigation";

export type SiteLink = {
  label: string;
  href?: string;
  current?: boolean;
};

export function SiteFrame({
  brand,
  links,
  children,
}: {
  brand: string;
  links: SiteLink[];
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-[#f3f6f1] text-emerald-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-emerald-200/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 size-96 rounded-full bg-lime-100/80 blur-3xl"
      />
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="size-5 text-emerald-800" aria-hidden />
            <p className="text-lg font-semibold tracking-tight">{brand}</p>
          </Link>
          {links.map((link) =>
            link.current || !link.href ? (
              <span
                key={link.label}
                className="text-sm font-medium text-emerald-950"
                aria-current="page"
              >
                {link.label}
              </span>
            ) : (
              <Link key={link.label} href={link.href} className="text-sm text-emerald-800">
                {link.label}
              </Link>
            ),
          )}
        </div>
        <AuthButton />
      </header>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
