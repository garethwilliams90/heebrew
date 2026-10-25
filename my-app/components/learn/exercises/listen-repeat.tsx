"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MicIcon, MicOff } from "lucide-react";
import { AnswerPop, type AnswerTone } from "@/components/learn/exercises/answer-mark";
import { ExerciseChrome } from "@/components/learn/exercises/lesson-session";
import { useAdvance } from "@/components/learn/exercises/use-advance";
import { MicMeter } from "@/components/learn/mic-meter";
import { printFont } from "@/components/alephbet/print-font";
import { HearReplayButton } from "@/components/learn/hear-replay";
import { Button } from "@/components/ui/button";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { recordWavClip, wavBlob } from "@/lib/learn/record-clip";
import { playStudyClip } from "@/lib/learn/pathway/play-study";
import type { SpokenItem } from "@/lib/learn/pathway/types";
import { cn } from "cn";

const recordMs = 4000;
const deviceKey = "webrew.mic-device";

type Phase = "ready" | "listening" | "scoring" | "close" | "wrong" | "missing";

export function ListenRepeat({
  items,
  onPass,
  onMiss,
}: {
  items: readonly SpokenItem[];
  onPass: () => void;
  onMiss?: () => void;
}) {
  const t = useTranslations("Learn");
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [tone, setTone] = useState<AnswerTone>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const item = items[index];
  const advance = useAdvance(() => {
    if (index >= items.length - 1) {
      onPass();
      return;
    }
    setTone(null);
    setPhase("ready");
    setIndex((current) => current + 1);
  }, onMiss);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const stored = window.localStorage.getItem(deviceKey) ?? "";
    setDeviceId(stored);
    void refreshDevices();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!item) {
      return;
    }
    void playStudyClip({ ...item, letterId: undefined });
  }, [item]);

  async function refreshDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return;
    }
    const list = await navigator.mediaDevices.enumerateDevices();
    setDevices(list.filter((entry) => entry.kind === "audioinput"));
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
  }

  async function speak() {
    if (!item || phase === "listening" || phase === "scoring") {
      return;
    }
    if (mutedRef.current) {
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase("missing");
      return;
    }
    stopStream();
    const audio: MediaTrackConstraints = { channelCount: 1, echoCancellation: true };
    if (deviceId) {
      audio.deviceId = { exact: deviceId };
    }
    let next: MediaStream;
    try {
      next = await navigator.mediaDevices.getUserMedia({ audio });
    } catch {
      setPhase("missing");
      return;
    }
    streamRef.current = next;
    setStream(next);
    setTone(null);
    setPhase("listening");
    setElapsed(0);
    void refreshDevices();
    const started = performance.now();
    const timer = window.setInterval(() => {
      setElapsed(Math.min(100, ((performance.now() - started) / recordMs) * 100));
    }, 80);
    const wav = await recordWavClip(next, recordMs, () => !mutedRef.current);
    window.clearInterval(timer);
    setElapsed(0);
    stopStream();
    if (mutedRef.current || !wav) {
      setPhase(mutedRef.current ? "ready" : "missing");
      return;
    }
    setPhase("scoring");
    const form = new FormData();
    form.set("expected", item.say || item.hebrew);
    form.set("audio", wavBlob(wav), "clip.wav");
    try {
      const response = await fetch("/api/speech/score", { method: "POST", body: form });
      const body = (await response.json()) as { pass?: boolean; close?: boolean };
      if (body.pass && body.close) {
        setTone("correct");
        setPhase("close");
        window.setTimeout(() => advance.pass(), 900);
        return;
      }
      if (body.pass) {
        setTone("correct");
        setPhase("ready");
        advance.pass();
        return;
      }
    } catch {
      setTone("wrong");
      setPhase("wrong");
      advance.miss(() => void playStudyClip({ ...item, letterId: undefined }));
      return;
    }
    setTone("wrong");
    setPhase("wrong");
    advance.miss(() => void playStudyClip({ ...item, letterId: undefined }));
  }

  if (!item) {
    return null;
  }

  return (
    <ExerciseChrome index={index} total={items.length} prompt={t("speakPrompt")}>
    <div className="flex w-full max-w-xl flex-col items-center gap-5 text-center">
      <AnswerPop tone={tone}>
        <p
          className={cn(
            printFont.className,
            "text-6xl text-emerald-950",
            tone === "correct" && "text-green-700",
            tone === "wrong" && "text-red-700",
          )}
          dir="rtl"
          lang="he"
        >
          {item.hebrew}
        </p>
      </AnswerPop>
      <div className="flex w-full flex-col gap-2 justify-center items-center">
        <ProgressMeter
          label={t("speakListening")}
          value={Math.round(elapsed)}
          max={100}
          ratio={phase === "listening" ? elapsed : 0}
          pace="tick"
          className="h-2 w-full rounded-full bg-emerald-950/10"
        />
        <MicMeter stream={phase === "listening" ? stream : null} correct={tone === "correct"} onPeak={() => undefined} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        <label className="flex items-center gap-2 text-sm text-emerald-950" htmlFor="mic-source">
          {t("micSource")}
          <select
            id="mic-source"
            value={deviceId}
            className="max-w-48 rounded-lg border border-emerald-950/15 bg-white px-2 py-1"
            onChange={(event) => {
              setDeviceId(event.target.value);
              window.localStorage.setItem(deviceKey, event.target.value);
            }}
          >
            <option value="">{t("micDefault")}</option>
            {devices.map((entry) => (
              <option key={entry.deviceId} value={entry.deviceId}>
                {entry.label || t("micSource")}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          sound={false}
          variant={muted ? "default" : "outline"}
          onClick={() => {
            setMuted((current) => !current);
            mutedRef.current = !muted;
          }}
        >
          <MicOff />
        </Button>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <HearReplayButton onHear={() => void playStudyClip({ ...item, letterId: undefined })}>{t("speakHear")}</HearReplayButton>
        <Button variant="default" sound={false} onClick={() => void speak()} disabled={muted || phase === "listening" || phase === "scoring"}>
          <MicIcon />
          {phase === "listening" ? t("speakListening") : phase === "scoring" ? t("speakScoring") : t("speakSay")}
        </Button>
      </div>
      {muted ? <p className="text-emerald-800">{t("micMuted")}</p> : null}
      {phase === "close" ? <p className="text-emerald-800">{t("slightlyOff")}</p> : null}
      {phase === "wrong" ? <p className="text-red-800">{t("speakWrong")}</p> : null}
      {phase === "missing" ? <p className="text-emerald-800">{t("speakMicMissing")}</p> : null}
    </div>
    </ExerciseChrome>
  );
}
