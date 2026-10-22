"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { MicIcon } from "lucide-react";
import { useCue } from "@/components/settings/use-cue";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { MicMeter } from "@/components/learn/mic-meter";
import { BlueNikud } from "@/components/learn/pointed-letter";
import { Button } from "@/components/ui/button";
import { addExperience } from "@/lib/flashcards/experience";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { rememberKnownWord } from "@/lib/learn/known-words";
import { recordWavClip, wavBlob } from "@/lib/learn/record-clip";
import type { SoundPrompt } from "@/lib/learn/sound-exercises";
import { playAudio } from "@/lib/settings/master-volume";

const lessonExperience = 6;
const recordMs = 4000;
const quietPeak = 0.04;
const cardShadow = "0 24px 60px -32px rgba(6, 78, 59, 0.45)";

type Phase = "ready" | "listening" | "scoring" | "correct" | "wrong" | "empty" | "quiet" | "missing";

type ScoreResponse = {
  pass?: boolean;
  closest?: string;
};

export function SoundSpeak({ items, onPass }: { items: readonly SoundPrompt[]; onPass: () => void }) {
  const t = useTranslations("Learn");
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [closest, setClosest] = useState("");
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const playWrong = useCue("wrong");
  const playSuccess = useCue("success");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const outcome = useRef<"idle" | "hit" | "miss">("idle");
  const peak = useRef(0);
  const micRef = useRef<MediaStream | null>(null);
  const passRef = useRef(onPass);
  const session = useRef(0);
  const timers = useRef<number[]>([]);
  const lesson = items[index];
  const done = index >= items.length;

  passRef.current = onPass;

  useEffect(() => {
    for (const item of items) {
      void loadSpeechClip(item.hebrew);
    }
  }, [items]);

  useEffect(() => {
    return () => {
      session.current += 1;
      micRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function stopMic() {
    micRef.current?.getTracks().forEach((track) => track.stop());
    micRef.current = null;
    setMicStream(null);
  }

  function clearTimers() {
    for (const timer of timers.current) {
      window.clearTimeout(timer);
    }
    timers.current = [];
  }

  function later(run: () => void, delay: number) {
    const timer = window.setTimeout(run, delay);
    timers.current.push(timer);
  }

  async function openMic() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    micRef.current = stream;
    setMicStream(stream);
    return stream;
  }

  async function scoreClip(current: SoundPrompt, wav: ArrayBuffer) {
    const form = new FormData();
    form.set("promptId", current.id);
    form.set("audio", wavBlob(wav), "clip.wav");
    const response = await fetch("/api/speech/score", { method: "POST", body: form });
    if (!response.ok) {
      return { pass: false } as ScoreResponse;
    }
    return (await response.json()) as ScoreResponse;
  }

  async function capture(current: SoundPrompt, waitForSample: boolean, fromGesture: boolean) {
    const id = session.current + 1;
    session.current = id;
    const live = () => session.current === id;
    clearTimers();
    stopMic();
    peak.current = 0;
    outcome.current = "idle";
    setClosest("");
    setPhase("ready");

    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase("missing");
      return;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await openMic();
    } catch {
      stream = null;
    }
    if (!live()) {
      stream?.getTracks().forEach((track) => track.stop());
      return;
    }
    if (!stream) {
      if (fromGesture) {
        setPhase("missing");
      }
      return;
    }

    if (waitForSample) {
      const sample = audioRef.current;
      if (sample) {
        await playSample(sample);
      }
      if (!live()) {
        return;
      }
      await new Promise<void>((resolve) => {
        later(() => resolve(), 400);
      });
      if (!live()) {
        return;
      }
    }

    peak.current = 0;
    setPhase("listening");
    const ear = new AudioContext();
    const source = ear.createMediaStreamSource(stream);
    const analyser = ear.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const watch = () => {
      if (!live()) {
        return;
      }
      try {
        analyser.getByteTimeDomainData(data);
      } catch {
        return;
      }
      let max = 0;
      for (let index = 0; index < data.length; index += 1) {
        const sample = Math.abs(data[index] - 128) / 128;
        if (sample > max) {
          max = sample;
        }
      }
      if (max > peak.current) {
        peak.current = max;
      }
      window.requestAnimationFrame(watch);
    };
    void ear.resume().then(() => {
      if (live()) {
        watch();
      }
    });
    const wav = await recordWavClip(stream, recordMs, live);
    void ear.close();
    if (!live() || outcome.current !== "idle") {
      return;
    }
    if (!wav) {
      stopMic();
      setPhase("missing");
      return;
    }
    if (peak.current < quietPeak) {
      stopMic();
      setPhase("quiet");
      return;
    }

    setPhase("scoring");
    let result: ScoreResponse = { pass: false };
    try {
      result = await scoreClip(current, wav);
    } catch {
      result = { pass: false };
    }
    if (!live() || outcome.current !== "idle") {
      return;
    }

    stopMic();
    if (result.pass) {
      outcome.current = "hit";
      playSuccess();
      void addExperience(lessonExperience);
      if (current.knownWord) {
        void rememberKnownWord(current.knownWord);
      }
      setPhase("correct");
      return;
    }

    outcome.current = "miss";
    playWrong();
    setClosest(typeof result.closest === "string" ? result.closest : "");
    setPhase("wrong");
  }

  async function playSample(audio: HTMLAudioElement) {
    audio.pause();
    audio.currentTime = 0;
    try {
      await playAudio(audio);
    } catch {
      return;
    }
  }

  useEffect(() => {
    if (!lesson) {
      return;
    }
    let active = true;
    void loadSpeechClip(lesson.hebrew).then((audio) => {
      if (!active || !audio) {
        return;
      }
      audioRef.current = audio;
      void capture(lesson, true, false);
    });
    return () => {
      active = false;
      session.current += 1;
      clearTimers();
      audioRef.current?.pause();
      stopMic();
    };
    // Restart capture when the prompt card changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson]);

  function replay() {
    if (!lesson || outcome.current === "hit" || phase === "scoring") {
      return;
    }
    void (async () => {
      const audio = audioRef.current ?? (await loadSpeechClip(lesson.hebrew));
      if (!audio) {
        return;
      }
      audioRef.current = audio;
      await capture(lesson, true, false);
    })();
  }

  function goNext() {
    if (outcome.current !== "hit") {
      return;
    }
    outcome.current = "idle";
    setClosest("");
    setPhase("ready");
    setIndex((value) => {
      const next = value + 1;
      if (next >= items.length) {
        passRef.current();
      }
      return next;
    });
  }

  function speak() {
    if (!lesson || outcome.current === "hit" || phase === "listening" || phase === "scoring") {
      return;
    }
    void capture(lesson, false, true);
  }

  if (done || !lesson) {
    return null;
  }

  const question = Math.min(index + 1, items.length);
  const ratio = ((index + 0.5) / items.length) * 100;
  const busy = phase === "listening" || phase === "scoring";

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3">
      <div className="flex w-full flex-col items-center gap-3">
        <div className="w-full">
          <ProgressMeter
            label={t("quizProgress", { done: question, total: items.length })}
            value={question}
            max={items.length}
            ratio={ratio}
            sections={items.length}
            className="h-2.5 rounded-full bg-emerald-950/10"
          />
        </div>
        <div className="text-center">
          <p className="text-base text-emerald-900/80 sm:text-lg">{t("speakTask")}</p>
          <p className="mt-2 text-sm text-emerald-800">{t("quizProgress", { done: question, total: items.length })}</p>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", bounce: 0.18, visualDuration: 0.28 }}
            className="flex aspect-square w-44 items-center justify-center rounded-2xl border border-foreground/10 bg-card sm:w-52"
            style={{ boxShadow: cardShadow }}
            aria-label={lesson.hebrew}
          >
            <BlueNikud text={lesson.hebrew} className={cn(printFont.className, "text-7xl leading-none sm:text-8xl")} />
          </motion.div>
        </AnimatePresence>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="outline" className="h-11 px-5" sound={false} disabled={phase === "scoring"} onClick={replay}>
            {t("speakHear")}
          </Button>
          <Button type="button" className="h-11 px-5" sound={false} disabled={busy || phase === "correct"} onClick={speak}>
            <MicIcon className="size-4" />
            {phase === "listening" ? t("speakListening") : phase === "scoring" ? t("speakScoring") : t("speakSay")}
          </Button>
          <Button type="button" className="h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900" disabled={phase !== "correct"} onClick={goNext}>
            {t("speakNext")}
          </Button>
        </div>
        <MicMeter
          stream={phase === "listening" ? micStream : null}
          correct={phase === "correct"}
          onPeak={(value) => {
            if (value > peak.current) peak.current = value;
          }}
        />
        <p className="min-h-6 text-center text-sm text-emerald-900" aria-live="polite">
          {phase === "correct" ? t("speakCorrect") : null}
          {phase === "wrong" && closest
            ? t.rich("speakWrongClosest", {
                word: () => (
                  <span dir="rtl" lang="he">
                    {closest}
                  </span>
                ),
              })
            : null}
          {phase === "wrong" && !closest ? t("speakWrong") : null}
          {phase === "empty" ? t("speakEmpty") : null}
          {phase === "quiet" ? t("speakQuiet") : null}
          {phase === "missing" ? t("speakMicMissing") : null}
          {phase === "scoring" ? t("speakScoring") : null}
        </p>
      </div>
    </div>
  );
}
