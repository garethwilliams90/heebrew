"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import useSound from "use-sound";
import { lessonAudioUrl } from "@/lib/audio/lesson-audio";
import { setMasterVolume } from "@/lib/settings/master-volume";

const STORAGE_KEY = "webrew.settings";

export type SampleName = "switchOn" | "switchOff" | "popUp" | "popDown" | "success" | "wrong";

const samples: Record<SampleName, { src: string; gain: number }> = {
  switchOn: { src: lessonAudioUrl("ui/switch-on.mp3"), gain: 0.5 },
  switchOff: { src: lessonAudioUrl("ui/switch-off.mp3"), gain: 0.5 },
  popUp: { src: lessonAudioUrl("ui/pop-up-on.mp3"), gain: 0.5 },
  popDown: { src: lessonAudioUrl("ui/pop-down.mp3"), gain: 0.5 },
  success: { src: lessonAudioUrl("ui/success.mp3"), gain: 0.55 },
  wrong: { src: lessonAudioUrl("ui/disable-sound.mp3"), gain: 0.5 },
};

type StoredSettings = {
  sound: boolean;
  volume: number;
  clock: boolean;
  night: boolean;
};

type SettingsContextValue = StoredSettings & {
  toggleSound: () => void;
  toggleClock: () => void;
  toggleNight: () => void;
  setVolume: (volume: number) => void;
  playSwitch: (on: boolean) => void;
  playSample: (name: SampleName) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const fallback: StoredSettings = { sound: true, volume: 0.8, clock: false, night: false };

function applyNight(night: boolean) {
  document.documentElement.classList.toggle("dark", night);
}

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
      night: parsed.night === true,
    };
  } catch {
    return fallback;
  }
}

function useSample(name: SampleName, sound: boolean, volume: number) {
  const { src, gain } = samples[name];
  const audible = sound ? gain * volume : 0;
  const [play] = useSound(src, { interrupt: true, volume: audible, soundEnabled: audible > 0 });
  return play;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [sound, setSound] = useState(true);
  const [volume, setVolumeState] = useState(0.8);
  const [clock, setClock] = useState(false);
  const [night, setNight] = useState(false);
  const [ready, setReady] = useState(false);
  const soundRef = useRef(sound);
  const clockRef = useRef(clock);
  const nightRef = useRef(night);
  // Toggling sound itself stays audible, so muting still clicks.
  const switchGain = Math.max(volume, 0.45);
  const [playOn] = useSound(samples.switchOn.src, { interrupt: true, volume: switchGain });
  const [playOff] = useSound(samples.switchOff.src, { interrupt: true, volume: switchGain });
  const playSwitchOn = useSample("switchOn", sound, volume);
  const playSwitchOff = useSample("switchOff", sound, volume);
  const playPopUp = useSample("popUp", sound, volume);
  const playPopDown = useSample("popDown", sound, volume);
  const playSuccess = useSample("success", sound, volume);
  const playWrong = useSample("wrong", sound, volume);
  const players = useRef<Record<SampleName, () => void> | null>(null);
  const playOnRef = useRef(playOn);
  const playOffRef = useRef(playOff);

  useEffect(() => {
    players.current = {
      switchOn: playSwitchOn,
      switchOff: playSwitchOff,
      popUp: playPopUp,
      popDown: playPopDown,
      success: playSuccess,
      wrong: playWrong,
    };
    soundRef.current = sound;
    clockRef.current = clock;
    nightRef.current = night;
    playOnRef.current = playOn;
    playOffRef.current = playOff;
  });

  useLayoutEffect(() => {
    const stored = readStored();
    setSound(stored.sound);
    setVolumeState(stored.volume);
    setClock(stored.clock);
    setNight(stored.night);
    nightRef.current = stored.night;
    applyNight(stored.night);
    setReady(true);
    // Color fades start after the stored theme is on screen, so the first paint does not animate.
    const frame = requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-ready");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setMasterVolume(sound ? volume : 0);
  }, [sound, volume]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    const next: StoredSettings = { sound, volume, clock, night };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    applyNight(night);
  }, [ready, sound, volume, clock, night]);

  const playSwitch = useCallback((on: boolean) => {
    const play = on ? playOnRef.current : playOffRef.current;
    play();
  }, []);

  const playSample = useCallback((name: SampleName) => {
    if (!soundRef.current) {
      return;
    }
    players.current?.[name]();
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

  const toggleNight = useCallback(() => {
    const next = !nightRef.current;
    nightRef.current = next;
    applyNight(next);
    playSwitch(next);
    setNight(next);
  }, [playSwitch]);

  const setVolume = useCallback((next: number) => {
    setVolumeState(Math.min(1, Math.max(0, next)));
  }, []);

  const value = useMemo(
    () => ({ sound, volume, clock, night, toggleSound, toggleClock, toggleNight, setVolume, playSwitch, playSample }),
    [sound, volume, clock, night, toggleSound, toggleClock, toggleNight, setVolume, playSwitch, playSample],
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

export function useOptionalSettings() {
  return useContext(SettingsContext);
}

export function usePlaySample() {
  const playSample = useOptionalSettings()?.playSample;
  return useCallback((name: SampleName) => playSample?.(name), [playSample]);
}
