"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { MicIcon } from "lucide-react";
import { useCue } from "@/components/settings/use-cue";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { BlueNikud } from "@/components/learn/pointed-letter";
import { Button } from "@/components/ui/button";
import { alphabetLetters, nikudCue } from "@/lib/alephbet/intro-alphabet";
import { addExperience } from "@/lib/flashcards/experience";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { consonantSrc, saidSyllable, speakSteps, type SpeakStep } from "@/lib/learn/consonant-sounds";
import { playAudio } from "@/lib/settings/master-volume";

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
  onstart: (() => void) | null;
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
  const [phase, setPhase] = useState<"ready" | "listening" | "correct" | "wrong" | "empty" | "quiet" | "missing">("ready");
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const playWrong = useCue("wrong");
  const playSuccess = useCue("success");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<BrowserRecognition | null>(null);
  const outcome = useRef<"idle" | "hit" | "miss">("idle");
  const peak = useRef(0);
  const heardRef = useRef("");
  const micRef = useRef<MediaStream | null>(null);
  const passRef = useRef(onPass);
  const session = useRef(0);
  const timers = useRef<number[]>([]);
  const armRef = useRef<(() => void) | null>(null);
  const holdSample = useRef(true);
  const sampleReleased = useRef(false);
  const earContext = useRef<AudioContext | null>(null);
  const lesson = speakSteps[index];
  const done = index >= speakSteps.length;

  passRef.current = onPass;

  useEffect(() => {
    return () => {
      session.current += 1;
      recognitionRef.current?.abort();
      micRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function stopMic() {
    micRef.current?.getTracks().forEach((track) => track.stop());
    micRef.current = null;
    void earContext.current?.close();
    earContext.current = null;
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

  function releaseSample() {
    sampleReleased.current = true;
    armRef.current?.();
  }

  function playSample(audio: HTMLAudioElement, step: SpeakStep) {
    let released = false;
    const finish = () => {
      if (released) {
        return;
      }
      released = true;
      releaseSample();
    };
    const afterConsonant = async () => {
      const letter = alphabetLetters().find((item) => item.id === step.letterId);
      const cue = letter ? nikudCue(letter, step.vowel) : { text: `${step.letter}${step.mark}` };
      const clip = await loadSpeechClip(cue.text, cue.phoneme);
      if (clip) {
        clip.currentTime = 0;
        await playAudio(clip).catch(() => undefined);
      }
      finish();
    };
    audio.addEventListener("ended", () => void afterConsonant(), { once: true });
    later(finish, 7000);
    void playAudio(audio).catch(() => void afterConsonant());
  }

  async function openEar(current: SpeakStep, waitForSample: boolean, fromGesture: boolean) {
    const id = session.current + 1;
    session.current = id;
    const live = () => session.current === id;
    clearTimers();
    armRef.current = null;
    sampleReleased.current = !waitForSample;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    stopMic();
    peak.current = 0;
    heardRef.current = "";
    outcome.current = "idle";
    setHeard("");
    setPhase("ready");

    const Ctor = recognitionCtor();
    if (!Ctor) {
      setPhase("missing");
      return;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch {
      stream = null;
    }
    if (!live()) {
      stream?.getTracks().forEach((track) => track.stop());
      return;
    }
    if (stream) {
      micRef.current = stream;
      setMicStream(stream);
      const context = new AudioContext();
      earContext.current = context;
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
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
      void context.resume().then(() => {
        if (live()) {
          watch();
        }
      });
    }

    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;
    recognitionRef.current = recognition;

    let armed = false;
    let arming = false;
    let startedAt = 0;
    let acceptNotBefore = Number.POSITIVE_INFINITY;
    let sampleDone = sampleReleased.current;
    holdSample.current = waitForSample;

    function accept() {
      if (!live() || outcome.current !== "idle") {
        return;
      }
      outcome.current = "hit";
      clearTimers();
      recognition.stop();
      stopMic();
      playSuccess();
      void addExperience(lessonExperience);
      setPhase("correct");
      setHeard("");
    }

    function finish() {
      if (!live() || outcome.current !== "idle") {
        return;
      }
      outcome.current = "miss";
      recognition.stop();
      stopMic();
      const heard = heardRef.current;
      if (!heard && peak.current < 0.04) {
        setPhase("quiet");
        return;
      }
      playWrong();
      setPhase(heard ? "wrong" : "empty");
    }

    function tryArm() {
      if (!live() || armed || arming || !sampleDone || !startedAt) {
        return;
      }
      arming = true;
      const beat = holdSample.current ? 450 : 0;
      const readyAt = Math.max(startedAt + 400, performance.now() + beat);
      later(() => {
        arming = false;
        if (!live() || outcome.current !== "idle") {
          return;
        }
        if (performance.now() < startedAt + 380) {
          tryArm();
          return;
        }
        armed = true;
        peak.current = 0;
        setPhase("listening");
        later(finish, 6500);
      }, Math.max(0, readyAt - performance.now()));
    }

    armRef.current = () => {
      sampleDone = true;
      tryArm();
    };

    recognition.onstart = () => {
      startedAt = performance.now();
      acceptNotBefore = startedAt + 380;
      tryArm();
    };

    recognition.onresult = (event) => {
      if (!live() || !armed || outcome.current !== "idle" || performance.now() < acceptNotBefore) {
        return;
      }
      const result = event.results[event.results.length - 1];
      if (!result) {
        return;
      }
      const transcripts = Array.from({ length: result.length }, (_, choice) => result[choice]?.transcript ?? "");
      const line = transcripts[0] ?? "";
      heardRef.current = line;
      setHeard(line);
      const match = transcripts.some((transcript) => saidSyllable(current, transcript));
      if (!match) {
        return;
      }
      if (micRef.current && peak.current < 0.015) {
        return;
      }
      accept();
    };

    recognition.onerror = (event) => {
      if (!live() || event.error === "aborted" || event.error === "no-speech") {
        return;
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed" || event.error === "language-not-supported") {
        recognitionRef.current = null;
        if (fromGesture || event.error === "language-not-supported") {
          outcome.current = "miss";
          setPhase("missing");
        }
      }
    };

    recognition.onend = () => {
      if (!live() || outcome.current !== "idle") {
        return;
      }
      try {
        recognition.start();
      } catch {
        recognitionRef.current = null;
      }
    };

    if (sampleDone) {
      tryArm();
    }

    try {
      recognition.start();
    } catch {
      if (live()) {
        setPhase(fromGesture ? "missing" : "ready");
      }
    }
  }

  useEffect(() => {
    if (!lesson) {
      return;
    }
    const audio = new Audio(consonantSrc(lesson.file));
    audioRef.current = audio;
    void openEar(lesson, true, false);
    playSample(audio, lesson);
    return () => {
      audio.pause();
      session.current += 1;
      clearTimers();
      armRef.current = null;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      stopMic();
    };
    // openEar restarts the mic for the letter that just appeared.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson]);

  function replay() {
    if (!lesson || outcome.current === "hit") {
      return;
    }
    const audio = audioRef.current ?? new Audio(consonantSrc(lesson.file));
    audioRef.current = audio;
    audio.pause();
    audio.currentTime = 0;
    void openEar(lesson, true, false);
    playSample(audio, lesson);
  }

  function goNext() {
    if (outcome.current !== "hit") {
      return;
    }
    outcome.current = "idle";
    setHeard("");
    setPhase("ready");
    setIndex((value) => {
      const next = value + 1;
      if (next >= speakSteps.length) {
        passRef.current();
      }
      return next;
    });
  }

  function speak(current: SpeakStep) {
    if (outcome.current === "hit" || phase === "listening") {
      return;
    }
    audioRef.current?.pause();
    if (recognitionRef.current && outcome.current === "idle") {
      holdSample.current = false;
      releaseSample();
      return;
    }
    void openEar(current, false, true);
  }

  if (done || !lesson) {
    return null;
  }

  const question = Math.min(index + 1, speakSteps.length);
  const ratio = ((index + 0.5) / speakSteps.length) * 100;
  const consonant = lesson.consonant === "quiet" ? t("speakNoConsonant") : lesson.consonant;

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3">
      <div className="flex w-full flex-col items-center gap-3">
        <div className="w-full">
          <ProgressMeter
            label={t("quizProgress", { done: question, total: speakSteps.length })}
            value={question}
            max={speakSteps.length}
            ratio={ratio}
            sections={speakSteps.length}
            className="h-2.5 rounded-full bg-emerald-950/10"
          />
        </div>
        <div className="text-center">
          <p className="text-base text-emerald-900/80 sm:text-lg">{t("speakTask", { consonant, sound: lesson.sound })}</p>
          <p className="mt-2 text-sm text-emerald-800">{t("quizProgress", { done: question, total: speakSteps.length })}</p>
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
            aria-label={lesson.sound}
          >
            <BlueNikud text={`${lesson.letter}${lesson.mark}`} className={cn(printFont.className, "text-7xl leading-none sm:text-8xl")} />
          </motion.div>
        </AnimatePresence>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="outline" className="h-11 px-5" sound={false} onClick={replay}>
            {t("speakHear")}
          </Button>
          <Button type="button" className="h-11 px-5" sound={false} disabled={phase === "listening" || phase === "correct"} onClick={() => speak(lesson)}>
            <MicIcon className="size-4" />
            {phase === "listening" ? t("speakListening") : t("speakSay", { sound: lesson.sound })}
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

function bellHeight(index: number, count: number) {
  const x = count <= 1 ? 0 : (index / (count - 1)) * 2 - 1;
  return Math.exp(-2.4 * x * x);
}

function MicMeter({
  stream,
  correct,
  onPeak,
}: {
  stream: MediaStream | null;
  correct: boolean;
  onPeak: (value: number) => void;
}) {
  const bars = useRef<HTMLSpanElement[]>([]);
  const peakRef = useRef(onPeak);
  peakRef.current = onPeak;

  useEffect(() => {
    if (!stream) {
      for (const bar of bars.current) {
        if (bar) bar.style.transform = correct ? "scaleY(0.92)" : "scaleY(0.08)";
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
        const sampleIndex = Math.floor((index / Math.max(1, nodes.length - 1)) * (data.length - 1));
        const sample = Math.abs(data[sampleIndex] - 128) / 128;
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
  }, [stream, correct]);

  const count = 17;

  return (
    <div className="flex h-16 w-72 items-end justify-center gap-1 sm:w-80" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="flex w-2 items-end rounded-full bg-emerald-950/10"
          style={{ height: `${Math.round(bellHeight(index, count) * 100)}%` }}
        >
          <span
            ref={(node) => {
              if (node) bars.current[index] = node;
            }}
            className={cn("h-full w-full origin-bottom rounded-full", correct ? "bg-green-500" : "bg-emerald-600")}
            style={{ transform: correct ? "scaleY(0.92)" : "scaleY(0.12)" }}
          />
        </span>
      ))}
    </div>
  );
}
