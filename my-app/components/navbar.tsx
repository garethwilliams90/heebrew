"use client";

import { Leaf } from "lucide-react";
import { useTranslations } from "next-intl";
import { SocialLinks } from "@/components/social-links";
import { Link, usePathname } from "@/i18n/navigation";

export function Navbar({
  auth,
  children,
}: {
  auth: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const flashcards = useTranslations("Flashcards");
  const home = useTranslations("Home");
  const training = useTranslations("Training");
  const alephBet = useTranslations("AlephBet");
  const tabs = [
    { href: "/", label: home("nav") },
    { href: "/profile", label: home("profile") },
    { href: "/decks", label: flashcards("decks") },
    { href: "/training", label: training("nav") },
    { href: "/aleph-bet", label: alephBet("nav") },
  ];

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
            <p className="text-lg font-semibold tracking-tight">{flashcards("brand")}</p>
          </Link>
          {tabs.map((tab) => {
            const current = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={
                  current ? "text-sm font-medium text-emerald-950" : "text-sm text-emerald-800"
                }
                aria-current={current ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {auth}
          <SocialLinks />
        </div>
      </header>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
