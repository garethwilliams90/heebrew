"use client";

import { Leaf } from "lucide-react";
import { useTranslations } from "next-intl";
import { NatureScene } from "@/components/learn/nature-scene";
import { AppClock } from "@/components/settings/app-clock";
import { MobileMenu, SettingsMenu } from "@/components/settings/app-menus";
import { NavRail } from "@/components/settings/nav-rail";
import { SocialFab } from "@/components/settings/social-fab";
import { KofiHomeButton } from "@/components/support/kofi-support";
import { Link } from "@/i18n/navigation";

export function Navbar({
  email,
  children,
}: {
  email: string | null;
  children: React.ReactNode;
}) {
  const flashcards = useTranslations("Flashcards");

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#f3f6f1] text-emerald-950 transition-colors duration-300">
      <NatureScene />
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-emerald-200/50 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute right-0 bottom-0 size-96 rounded-full bg-lime-100/80 blur-3xl" />
      <Link href="/" className="fixed top-4 left-4 z-30 hidden items-center gap-2 md:flex">
        <Leaf className="size-5 text-emerald-800" aria-hidden />
        <p className="text-lg font-semibold tracking-tight">{flashcards("brand")}</p>
      </Link>
      <NavRail />
      <SettingsMenu email={email} />
      <MobileMenu email={email} />
      <AppClock />
      <KofiHomeButton />
      <SocialFab />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-1 pt-14 pb-16 md:pt-16 md:pr-16 md:pb-4 md:pl-20">
        {children}
      </div>
    </div>
  );
}
