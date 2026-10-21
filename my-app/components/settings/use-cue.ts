"use client";

import { useCallback, useRef } from "react";
import useSound from "use-sound";
import { useSettings } from "@/components/settings/settings-provider";

export function useCue(src: string, base = 0.5) {
  const { sound, volume } = useSettings();
  const audible = sound ? base * volume : 0;
  const [play] = useSound(src, { interrupt: true, volume: audible, soundEnabled: audible > 0 });
  const playRef = useRef(play);
  playRef.current = play;

  return useCallback(() => {
    playRef.current();
  }, []);
}
