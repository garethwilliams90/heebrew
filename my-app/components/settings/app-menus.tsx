"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { Leaf, Menu, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLinks } from "@/components/settings/nav-rail";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { lessonAudioUrl } from "@/lib/audio/lesson-audio";
import { useSettings } from "@/components/settings/settings-provider";
import { Link } from "@/i18n/navigation";

const spring = { type: "spring" as const, bounce: 0.18, visualDuration: 0.32 };

export function SettingsMenu({ email }: { email: string | null }) {
  const t = useTranslations("Settings");
  const { volume } = useSettings();
  const [open, setOpen] = useState(false);
  const rotation = useMotionValue(0);
  const clip = useRef<HTMLAudioElement | null>(null);
  const stopAt = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    return () => {
      if (stopAt.current) {
        window.clearTimeout(stopAt.current);
      }
      clip.current?.pause();
    };
  }, []);

  function playHalfSettings() {
    if (stopAt.current) {
      window.clearTimeout(stopAt.current);
    }
    const audio = clip.current ?? new Audio(lessonAudioUrl("ui/settings.mp3"));
    clip.current = audio;
    audio.volume = Math.max(volume, 0.45);
    const halt = () => {
      const halfway = audio.duration * 500;
      if (!Number.isFinite(halfway) || halfway <= 0) {
        return;
      }
      if (stopAt.current) {
        window.clearTimeout(stopAt.current);
      }
      stopAt.current = window.setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, halfway);
    };
    audio.currentTime = 0;
    if (audio.readyState < 1) {
      audio.addEventListener("loadedmetadata", halt, { once: true });
    } else {
      halt();
    }
    void audio.play().catch(() => {});
  }

  function toggle() {
    animate(rotation, open ? 0 : 270, { type: "spring", bounce: 0.5, visualDuration: 0.6 });
    playHalfSettings();
    setOpen((current) => !current);
  }

  return (
    <div className="fixed top-3 right-3 z-40 hidden flex-col items-end gap-2 md:flex">
      <motion.button
        type="button"
        style={{ rotate: rotation }}
        className="inline-flex size-11 items-center justify-center rounded-full border border-emerald-950/10 bg-white/95 text-emerald-950 shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30"
        aria-label={t("settings")}
        aria-expanded={open}
        onClick={toggle}
      >
        <Settings className="size-5" />
      </motion.button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={spring}
          >
            <SettingsPanel email={email} onDone={() => setOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function MobileMenu({ email }: { email: string | null }) {
  const t = useTranslations("Settings");
  const flashcards = useTranslations("Flashcards");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="fixed top-3 left-3 z-40 size-11 bg-white/95 md:hidden"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X /> : <Menu />}
      </Button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="sheet"
            className="fixed inset-0 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" className="absolute inset-0 bg-emerald-950/25" aria-label={t("closeMenu")} onClick={() => setOpen(false)} />
            <motion.div
              className="absolute top-0 left-0 flex h-dvh w-[min(20rem,calc(100vw-3rem))] flex-col gap-5 overflow-y-auto bg-[#f7faf6] px-4 pt-16 pb-8 shadow-xl"
              initial={{ x: -32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -32, opacity: 0 }}
              transition={spring}
            >
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <Leaf className="size-5 text-emerald-800" aria-hidden />
                <span className="text-lg font-semibold tracking-tight">{flashcards("brand")}</span>
              </Link>
              <NavLinks expanded onNavigate={() => setOpen(false)} />
              <SettingsPanel email={email} onDone={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
