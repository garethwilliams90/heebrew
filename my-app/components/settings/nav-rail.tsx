"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { BookOpen, GraduationCap, House, Library, UserRound } from "lucide-react";
import { LockedNavLink, type LockedFeature } from "@/components/learn/feature-access";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "cn";

const spring = { type: "spring" as const, bounce: 0.16, visualDuration: 0.28 };

type Tab = {
  href: "/" | "/profile" | "/decks" | "/training" | "/aleph-bet";
  label: string;
  feature?: LockedFeature;
  icon: typeof House;
};

export function NavLinks({
  expanded,
  onNavigate,
}: {
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const flashcards = useTranslations("Flashcards");
  const home = useTranslations("Home");
  const training = useTranslations("Training");
  const alephBet = useTranslations("AlephBet");
  const tabs: Tab[] = [
    { href: "/", label: home("nav"), icon: House },
    { href: "/profile", label: home("profile"), icon: UserRound },
    { href: "/decks", label: flashcards("decks"), icon: Library, feature: "study" },
    { href: "/training", label: training("nav"), icon: GraduationCap, feature: "training" },
    { href: "/aleph-bet", label: alephBet("nav"), icon: BookOpen, feature: "aleph" },
  ];

  return (
    <div className="flex flex-col gap-1">
      {tabs.map((tab) => {
        const current = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        const className = cn(
          "flex h-10 items-center gap-2 overflow-hidden rounded-xl px-2.5 text-sm",
          current ? "bg-emerald-100 font-medium text-emerald-950" : "text-emerald-800 hover:bg-emerald-50",
        );
        const body = (
          <>
            <Icon className="size-5 shrink-0" aria-hidden />
            <span className={cn("truncate", expanded ? "w-auto opacity-100" : "w-0 opacity-0")}>{tab.label}</span>
          </>
        );

        if (tab.feature && tab.href !== "/" && tab.href !== "/profile") {
          return (
            <LockedNavLink
              key={tab.href}
              href={tab.href}
              className={className}
              current={current}
              feature={tab.feature}
              onClick={onNavigate}
            >
              {body}
            </LockedNavLink>
          );
        }

        return (
          <Link key={tab.href} href={tab.href} className={className} aria-current={current ? "page" : undefined} onClick={onNavigate}>
            {body}
          </Link>
        );
      })}
    </div>
  );
}

export function NavRail() {
  const t = useTranslations("Settings");
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.nav
      aria-label={t("mainNav")}
      className="fixed top-1/2 left-3 z-30 hidden -translate-y-1/2 md:block"
      onHoverStart={() => setExpanded(true)}
      onHoverEnd={() => setExpanded(false)}
      onFocusCapture={() => setExpanded(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setExpanded(false);
        }
      }}
    >
      <motion.div
        className="overflow-hidden rounded-2xl border border-emerald-950/10 bg-white/90 p-1 shadow-[0_16px_40px_-28px_rgba(6,78,59,0.9)]"
        initial={false}
        animate={{ width: expanded ? 188 : 48 }}
        transition={spring}
      >
        <NavLinks expanded={expanded} />
      </motion.div>
    </motion.nav>
  );
}
