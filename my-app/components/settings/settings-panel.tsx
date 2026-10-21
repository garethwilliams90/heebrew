"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Clock, Languages, LogIn, LogOut, Maximize, Minimize, UserPlus, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/components/settings/settings-provider";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";

const localeLabel = {
  en: "english",
  fr: "french",
  es: "spanish",
} as const;

const localeFlag = {
  en: "🇬🇧",
  fr: "🇫🇷",
  es: "🇪🇸",
} as const;

const iconButton = "size-11 rounded-full bg-white/95 shadow-sm";

export function SettingsPanel({
  email,
  onDone,
}: {
  email: string | null;
  onDone?: () => void;
}) {
  const t = useTranslations("Settings");
  const auth = useTranslations("Auth");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { sound, volume, clock, toggleSound, toggleClock, setVolume, playSwitch } = useSettings();
  const [fullscreen, setFullscreen] = useState(false);
  const [languagesOpen, setLanguagesOpen] = useState(false);

  useEffect(() => {
    function sync() {
      setFullscreen(Boolean(document.fullscreenElement));
    }
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        playSwitch(false);
      } else {
        await document.documentElement.requestFullscreen();
        playSwitch(true);
      }
    } catch {
      return;
    }
  }

  async function logout() {
    playSwitch(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    onDone?.();
    router.push("/login");
    router.refresh();
  }

  function chooseLocale(next: (typeof routing.locales)[number]) {
    if (next === locale) {
      return;
    }
    playSwitch(true);
    setLanguagesOpen(false);
    onDone?.();
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex flex-col items-end justify-end gap-2">
      <div className="flex flex-row gap-2">
        {/* <Slider
          min={0}
          max={1}
          step={0.05}
          value={[volume]}
          aria-label={t("volume")}
          className="w-24"
          trackClassName="data-horizontal:h-2 data-vertical:w-2"
          onValueChange={(next) => setVolume(next[0] ?? 0)}
          /> */}
        <Button type="button" variant="outline" size="icon" className={iconButton} aria-pressed={sound} aria-label={t("sound")} onClick={toggleSound}>
          {sound ? <Volume2 /> : <VolumeX />}
        </Button>
        </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={iconButton}
        aria-expanded={languagesOpen}
        aria-label={t("language")}
        onClick={() => setLanguagesOpen((current) => !current)}
      >
        <Languages />
      </Button>
      {languagesOpen
        ? routing.locales.map((item) => (
            <Button
              key={item}
              type="button"
              variant={item === locale ? "default" : "outline"}
              size="icon"
              className={iconButton}
              aria-pressed={item === locale}
              aria-label={t(localeLabel[item])}
              onClick={() => chooseLocale(item)}
            >
              <span aria-hidden>{localeFlag[item]}</span>
            </Button>
          ))
        : null}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={iconButton}
        aria-pressed={fullscreen}
        aria-label={fullscreen ? t("exitFullscreen") : t("fullscreen")}
        onClick={() => void toggleFullscreen()}
      >
        {fullscreen ? <Minimize /> : <Maximize />}
      </Button>
      <Button type="button" variant="outline" size="icon" className={iconButton} aria-pressed={clock} aria-label={t("clock")} onClick={toggleClock}>
        <Clock />
      </Button>
      {email ? (
        <Button type="button" variant="outline" size="icon" className={iconButton} aria-label={auth("logOut")} onClick={() => void logout()}>
          <LogOut />
        </Button>
      ) : (
        <>
          <Button asChild variant="outline" size="icon" className={iconButton} aria-label={auth("logIn")}>
            <Link href="/login" onClick={onDone}>
              <LogIn />
            </Link>
          </Button>
          <Button asChild size="icon" className={iconButton} aria-label={auth("signUp")}>
            <Link href="/sign-up" onClick={onDone}>
              <UserPlus />
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
