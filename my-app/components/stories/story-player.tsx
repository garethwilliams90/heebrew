"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatClock, nearestRate, nextTime } from "@/lib/stories/playback";

export type StoryPlayerHandle = {
  currentTime: () => number;
};

export const StoryPlayer = forwardRef<StoryPlayerHandle, { src: string; onTime?: (seconds: number) => void; onPlaying?: (playing: boolean) => void; onDuration?: (seconds: number) => void }>(function StoryPlayer({ src, onTime, onPlaying, onDuration }, ref) {
  const t = useTranslations("Stories");
  const audioRef = useRef<HTMLAudioElement>(null);
  const onTimeRef = useRef(onTime);
  const onPlayingRef = useRef(onPlaying);
  const onDurationRef = useRef(onDuration);
  onTimeRef.current = onTime;
  onPlayingRef.current = onPlaying;
  onDurationRef.current = onDuration;
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [clock, setClock] = useState("0:00");
  const [duration, setDuration] = useState<number | null>(null);

  useImperativeHandle(ref, () => ({
    currentTime: () => audioRef.current?.currentTime ?? 0,
  }));

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = rate;
    }
  }, [rate, src]);

  useEffect(() => {
    if (!playing) {
      return;
    }
    let frame = 0;
    function tick() {
      const audio = audioRef.current;
      if (!audio || audio.paused) {
        return;
      }
      onTimeRef.current?.(audio.currentTime);
      frame = window.requestAnimationFrame(tick);
    }
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing]);

  function skip(delta: number) {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = nextTime(audio.currentTime, delta, duration);
    setClock(formatClock(audio.currentTime));
    onTimeRef.current?.(audio.currentTime);
  }

  function stop() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
    setClock("0:00");
    onTimeRef.current?.(0);
    onPlayingRef.current?.(false);
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <audio
        ref={audioRef}
        preload="metadata"
        src={src}
        onPlay={() => {
          setPlaying(true);
          onPlayingRef.current?.(true);
        }}
        onPause={() => {
          setPlaying(false);
          onPlayingRef.current?.(false);
        }}
        onTimeUpdate={(event) => {
          setClock(formatClock(event.currentTarget.currentTime));
          onTimeRef.current?.(event.currentTarget.currentTime);
        }}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          onDurationRef.current?.(event.currentTarget.duration);
        }}
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {clock}
        {duration != null ? ` / ${formatClock(duration)}` : ""}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <Button type="button" variant="outline" size="sm" onClick={() => skip(-15)} aria-label={t("back15")}>
          -15
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => skip(-5)} aria-label={t("back5")}>
          -5
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={toggle} aria-label={playing ? t("pause") : t("resume")}>
          {playing ? <Pause /> : <Play />}
        </Button>
        <Button type="button" variant="outline" size="icon" sound="popDown" onClick={stop} aria-label={t("stop")}>
          <Square />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => skip(5)} aria-label={t("forward5")}>
          +5
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => skip(15)} aria-label={t("forward15")}>
          +15
        </Button>
        <label className="flex items-center gap-2 text-sm">
          <span>{t("speed")}</span>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={rate}
            aria-valuetext={`${rate.toFixed(1)}×`}
            onChange={(event) => setRate(nearestRate(Number(event.target.value)))}
          />
          <span className="w-10 tabular-nums">{rate.toFixed(1)}×</span>
        </label>
      </div>
    </div>
  );
});
