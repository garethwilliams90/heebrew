"use client";

import { FeatureAccess, LockedNavLink } from "@/components/learn/feature-access";

export function FlashcardsNavLink({
  href,
  className,
  current,
  children,
}: {
  href: "/decks";
  className: string;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <LockedNavLink href={href} className={className} current={current} feature="study">
      {children}
    </LockedNavLink>
  );
}

export function FlashcardsAccess({ children }: { children: React.ReactNode }) {
  return <FeatureAccess feature="study">{children}</FeatureAccess>;
}
