"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useSettings } from "@/components/settings/settings-provider";

export function AppClock() {
  const locale = useLocale();
  const { clock } = useSettings();
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!clock) {
      return;
    }

    const format = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

    function tick() {
      setLabel(format.format(new Date()));
    }

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [clock, locale]);

  if (!clock || !label) {
    return null;
  }

  return (
    <time
      className="pointer-events-none fixed top-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-emerald-950/10 bg-white/90 px-3 py-1 text-sm font-medium text-emerald-950 tabular-nums shadow-sm"
      dateTime={label}
    >
      {label}
    </time>
  );
}
