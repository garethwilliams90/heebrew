"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { MicIcon } from "lucide-react";
import useSound from "use-sound";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { Button } from "@/components/ui/button";
import { addExperience } from "@/lib/flashcards/experience";
import { consonantLessons, consonantSrc, saidWithAh, type ConsonantLesson } from "@/lib/learn/consonant-sounds";

const lessonExperience = 6;
const cardShadow = "0 24px 60px -32px rgba(6, 78, 59, 0.45)";

type SpeechAlternative = { transcript: string };
type SpeechResult = { isFinal: boolean; length: number; [index: number]: SpeechAlternative };
type SpeechResultEvent = { results: ArrayLike<SpeechResult> };
type SpeechErrorEvent = { error: string };

type BrowserRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type RecognitionCtor = new () => BrowserRecognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") {
    return null;
  }
  const host = window as Window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

export function ConsonantSpeak({ onPass }: { onPass: () => void }) {
  const t = useTranslations("Learn");
  const [index, setIndex] = useState(0);
  const [heard, setHeard] = useState("");
  const [phase, setPhase] = useState<"ready" | "listening" | "wrong" | "empty" | "quiet" | "missing">("ready");
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [playWrong] = useSound("/sounds/samples/disable-sound.mp3", { volume: 0.5, interrupt: true });
  const [playSuccess] = useSound("/sounds/samples/success.mp3", { volume: 0.55, interrupt: true });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<BrowserRecognition | null>(null);
  const outcome = useRef<"idle" | "hit" | "miss">("idle");
  const peak = useRef(0);
  const micRef = useRef<MediaStream | null>(null);
  const passRef = useRef(onPass);
  const lesson = consonantLessons[index];
  const done = index >= consonantLessons.length;

  passRef.current = onPass;

  useEffect(() => {
    if (!lesson) {
      return;
    }

    const audio = new Audio(consonantSrc(lesson.file));
    audioRef.current = audio;
    void audio.play().catch(() => {});
    return () => {
      audio.pause();
    };
  }, [lesson]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      micRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function stopMic() {
    micRef.current?.getTracks().forEach((track) => track.stop());
    micRef.current = null;
    setMicStream(null);
  }

  function replay() {
    if (!lesson) {
      return;
    }
    const audio = audioRef.current ?? new Audio(consonantSrc(lesson.file));
    audioRef.current = audio;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }

  async function listen(current: ConsonantLesson) {
    const Ctor = recognitionCtor();
    if (!Ctor) {
      setPhase("missing");
      return;
    }

    audioRef.current?.pause();
    recognitionRef.current?.abort();
    stopMic();
    peak.current = 0;
    outcome.current = "idle";
    setHeard("");
    setPhase("listening");

    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (!result) {
        return;
      }
      const transcripts = Array.from({ length: result.length }, (_, choice) => result[choice]?.transcript ?? "");
      setHeard(transcripts[0] ?? "");
      const match = transcripts.some((transcript) => saidWithAh(current, transcript));
      if (!match) {
        if (!result.isFinal) {
          return;
        }
        outcome.current = "miss";
        recognition.stop();
        playWrong();
        setPhase(transcripts[0] ? "wrong" : "empty");
        return;
      }
      outcome.current = "hit";
      recognition.stop();
      playSuccess();
      void addExperience(lessonExperience);
      window.setTimeout(() => {
        setPhase("ready");
        setHeard("");
        setIndex((value) => {
          const next = value + 1;
          if (next >= consonantLessons.length) {
            passRef.current();
          }
          return next;
        });
      }, 700);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") {
        return;
      }
      outcome.current = "miss";
      if (event.error === "not-allowed" || event.error === "language-not-supported" || event.error === "service-not-allowed") {
        setPhase("missing");
        return;
      }
      playWrong();
      setPhase("empty");
    };

    const listenTimer = window.setTimeout(() => {
      if (outcome.current === "idle") {
        recognition.stop();
      }
    }, 5000);

    recognition.onend = () => {
      window.clearTimeout(listenTimer);
      stopMic();
      if (outcome.current === "idle") {
        setPhase(peak.current < 0.08 ? "quiet" : "empty");
      }
    };

    try {
      recognition.start();
    } catch {
      window.clearTimeout(listenTimer);
      setPhase("missing");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
      if (outcome.current !== "idle") {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      micRef.current = stream;
      setMicStream(stream);
    } catch {
      setMicStream(null);
    }
  }

  if (done || !lesson) {
    return null;
  }

  const question = Math.min(index + 1, consonantLessons.length);
  const ratio = ((index + 0.5) / consonantLessons.length) * 100;

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3">
      <div className="flex w-full flex-col items-center gap-3">
        <div className="w-full">
          <ProgressMeter
            label={t("quizProgress", { done: question, total: consonantLessons.length })}
            value={question}
            max={consonantLessons.length}
            ratio={ratio}
            sections={consonantLessons.length}
            className="h-2.5 rounded-full bg-emerald-950/10"
          />
        </div>
        <div className="text-center">
          <p className="text-base text-emerald-900/80 sm:text-lg">{t("speakPrompt")}</p>
          <p className="mt-2 text-sm text-emerald-800">{t("quizProgress", { done: question, total: consonantLessons.length })}</p>
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
            dir="rtl"
            lang="he"
            aria-label={lesson.letter}
          >
            <span className={cn(printFont.className, "text-7xl leading-none text-black sm:text-8xl")}>{lesson.letter}</span>
          </motion.div>
        </AnimatePresence>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="outline" className="h-11 px-5" onClick={replay}>
            {t("speakHear")}
          </Button>
          <Button type="button" className="h-11 px-5" disabled={phase === "listening"} onClick={() => listen(lesson)}>
            <MicIcon className="size-4" />
            {phase === "listening" ? t("speakListening") : t("speakSay", { sound: lesson.readings[0] })}
          </Button>
        </div>
        <MicMeter stream={phase === "listening" ? micStream : null} onPeak={(value) => {
          if (value > peak.current) peak.current = value;
        }} />
        <p className="min-h-6 text-center text-sm text-emerald-900" aria-live="polite">
          {phase === "listening" && heard ? heard : null}
          {phase === "wrong" ? t("speakWrong", { heard }) : null}
          {phase === "empty" ? t("speakEmpty") : null}
          {phase === "quiet" ? t("speakQuiet") : null}
          {phase === "missing" ? t("speakMicMissing") : null}
        </p>
      </div>
    </div>
  );
}

function MicMeter({ stream, onPeak }: { stream: MediaStream | null; onPeak: (value: number) => void }) {
  const bars = useRef<HTMLSpanElement[]>([]);
  const peakRef = useRef(onPeak);
  peakRef.current = onPeak;

  useEffect(() => {
    if (!stream) {
      for (const bar of bars.current) {
        if (bar) bar.style.transform = "scaleY(0.08)";
      }
      return;
    }

    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    let frame = 0;

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let max = 0;
      for (let index = 0; index < data.length; index += 1) {
        const sample = Math.abs(data[index] - 128) / 128;
        if (sample > max) max = sample;
      }
      peakRef.current(max);
      const nodes = bars.current;
      for (let index = 0; index < nodes.length; index += 1) {
        const sample = Math.abs(data[index * 4] - 128) / 128;
        const bar = nodes[index];
        if (bar) bar.style.transform = `scaleY(${Math.max(0.08, Math.min(1, sample * 3))})`;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      void context.close();
    };
  }, [stream]);

  return (
    <div className="flex h-10 w-44 items-end justify-center gap-1" aria-hidden>
      {Array.from({ length: 12 }, (_, index) => (
        <span key={index} className="flex h-full w-2 items-end rounded-full bg-emerald-950/10">
          <span
            ref={(node) => {
              if (node) bars.current[index] = node;
            }}
            className="h-full w-full origin-bottom rounded-full bg-emerald-600"
            style={{ transform: "scaleY(0.12)" }}
          />
        </span>
      ))}
    </div>
  );
}
