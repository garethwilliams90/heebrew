"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import useSound from "use-sound";
import { setMasterVolume } from "@/lib/settings/master-volume";

const STORAGE_KEY = "webrew.settings";

type StoredSettings = {
  sound: boolean;
  volume: number;
  clock: boolean;
};

type SettingsContextValue = StoredSettings & {
  toggleSound: () => void;
  toggleClock: () => void;
  setVolume: (volume: number) => void;
  playSwitch: (on: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const fallback: StoredSettings = { sound: true, volume: 0.8, clock: false };

function readStored(): StoredSettings {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<StoredSettings>;
    const volume = typeof parsed.volume === "number" ? parsed.volume : fallback.volume;
    return {
      sound: parsed.sound !== false,
      volume: Math.min(1, Math.max(0, volume)),
      clock: parsed.clock === true,
    };
  } catch {
    return fallback;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [sound, setSound] = useState(true);
  const [volume, setVolumeState] = useState(0.8);
  const [clock, setClock] = useState(false);
  const [ready, setReady] = useState(false);
  const soundRef = useRef(sound);
  const clockRef = useRef(clock);
  const switchGain = Math.max(volume, 0.45);
  const [playOn] = useSound("/sounds/samples/switch-on.mp3", { interrupt: true, volume: switchGain });
  const [playOff] = useSound("/sounds/samples/switch-off.mp3", { interrupt: true, volume: switchGain });
  const playOnRef = useRef(playOn);
  const playOffRef = useRef(playOff);

  soundRef.current = sound;
  clockRef.current = clock;
  playOnRef.current = playOn;
  playOffRef.current = playOff;

  useEffect(() => {
    const stored = readStored();
    setSound(stored.sound);
    setVolumeState(stored.volume);
    setClock(stored.clock);
    setReady(true);
  }, []);

  useEffect(() => {
    setMasterVolume(sound ? volume : 0);
  }, [sound, volume]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    const next: StoredSettings = { sound, volume, clock };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, [ready, sound, volume, clock]);

  const playSwitch = useCallback((on: boolean) => {
    const play = on ? playOnRef.current : playOffRef.current;
    play();
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundRef.current;
    soundRef.current = next;
    playSwitch(next);
    setSound(next);
  }, [playSwitch]);

  const toggleClock = useCallback(() => {
    const next = !clockRef.current;
    clockRef.current = next;
    playSwitch(next);
    setClock(next);
  }, [playSwitch]);

  const setVolume = useCallback((next: number) => {
    setVolumeState(Math.min(1, Math.max(0, next)));
  }, []);

  const value = useMemo(
    () => ({ sound, volume, clock, toggleSound, toggleClock, setVolume, playSwitch }),
    [sound, volume, clock, toggleSound, toggleClock, setVolume, playSwitch],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return value;
}
