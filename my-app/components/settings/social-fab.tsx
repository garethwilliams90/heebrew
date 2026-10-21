"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Share2, X } from "lucide-react";
import { socialLinks } from "@/lib/site/social";
import { Button } from "../ui/button";

const spring = { type: "spring" as const, bounce: 0.28, visualDuration: 0.32 };

export function SocialFab() {
  const t = useTranslations("Settings");
  const social = useTranslations("Social");
  const [open, setOpen] = useState(false);
  const links = [
    { href: socialLinks.github, label: social("github"), icon: <GithubIcon /> },
    { href: socialLinks.linkedin, label: social("linkedin"), icon: <LinkedInIcon /> },
  ];

  return (
    <div className="fixed right-3 bottom-3 z-40 flex flex-col items-end gap-2">
      <AnimatePresence initial={false}>
        {open
          ? links.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="inline-flex size-11 items-center justify-center rounded-full border border-emerald-950/10 bg-white text-emerald-950 shadow-sm"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.8 }}
                transition={{ ...spring, delay: index * 0.04 }}
              >
                {link.icon}
              </motion.a>
            ))
          : null}
      </AnimatePresence>
      <Button
        variant="outline"
        size="icon"
        className="inline-flex size-11 items-center justify-center rounded-full bg-emerald-800 text-white shadow-[0_16px_30px_-18px_rgba(6,78,59,0.9)] outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/40"
        aria-label={open ? t("closeLinks") : t("openLinks")}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="size-5" /> : <Share2 className="size-5" />}
      </Button>
    </div>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
