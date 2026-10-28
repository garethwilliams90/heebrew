"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ProgramLoader } from "@/components/program-loader";
import { AccountNotice } from "@/components/flashcards/account-notice";
import { useSoundPrefs, type SoundChannel } from "@/components/flashcards/sound-toggle";
import { SessionSummary, type SessionCardResult } from "@/components/flashcards/session-summary";
import { StudyCardView, type StudyCard } from "@/components/flashcards/study-card";
import { useCardDisplay } from "@/components/flashcards/study-tools";
import { LeafHeroScreen } from "@/components/leaf-hero-screen";
import { useSpeechClipCache } from "@/components/study/use-speech-clip-cache";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { recordDailyCards } from "@/lib/flashcards/daily-practice";
import { addExperience, flashcardExperience, loadExperience } from "@/lib/flashcards/experience";
import { loadDeckMemory, saveSessionProgress } from "@/lib/flashcards/progress";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { resolveLessonAudio } from "@/lib/audio/lesson-audio";
import { playAudio } from "@/lib/settings/master-volume";
import {
  freshMemory,
  gradeMemory,
  returnsSoon,
  soonestDue,
  type CardMemory,
  type FlashcardGrade,
} from "@/lib/flashcards/schedule";
import {
  buildPlannedSession,
  MAX_STUDY_COUNT,
  TRIAL_SECONDS,
  type StudyMode,
} from "@/lib/flashcards/study-plan";
import type { Flashcard } from "@/lib/flashcards/types";

function isStoredAudio(value: string) {
  return value.startsWith("/") || value.startsWith("https://") || value.startsWith("http://");
}

type StudyPhase = "study" | "done" | "caught-up";

export function FlashcardSession({
  deckId,
  cards,
  mode,
  count,
  prompt = "english",
  embedded = false,
  onExit,
}: {
  deckId: string;
  cards: Flashcard[];
  mode: StudyMode;
  count: number;
  prompt?: "english" | "hebrew";
  embedded?: boolean;
  onExit?: () => void;
}) {
  const t = useTranslations("Flashcards");
  const locale = useLocale();
  const sound = useSoundPrefs();
  const display = useCardDisplay();
  const cardsRef = useRef(cards);
  const memoriesRef = useRef<Record<string, CardMemory>>({});
  const updatesRef = useRef(
    new Map<string, { mastery: number; practices: number; memory: CardMemory }>(),
  );
  const experienceRef = useRef(0);
  const gainedRef = useRef(0);
  const rewardedRef = useRef(false);
  const savedRef = useRef(false);
  const savingRef = useRef<Promise<"ok" | "signed-out" | "error"> | null>(null);
  const [queue, setQueue] = useState<StudyCard[]>([]);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [speakingClip, setSpeakingClip] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState<StudyPhase>("study");
  const [nextDue, setNextDue] = useState<string | null>(null);
  const [reward, setReward] = useState<{ from: number; to: number } | null>(null);
  const [summary, setSummary] = useState<SessionCardResult[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(TRIAL_SECONDS);
  const [multiplier, setMultiplier] = useState(1);
  const [trialStats, setTrialStats] = useState({ correct: 0, best: 1 });
  const phaseRef = useRef<StudyPhase>("study");
  const baselinesRef = useRef(new Map<string, CardMemory>());
  const studiedRef = useRef(new Map<string, SessionCardResult>());
  const trialIdsRef = useRef<string[]>([]);
  const passRef = useRef(1);
  const endedRef = useRef(false);
  const multiplierRef = useRef(1);
  const bestRef = useRef(1);
  const correctRef = useRef(0);
  const endTrialRef = useRef<() => void>(() => {});
  const { clips, stopClips, disposeClips, loadSpeechTexts } = useSpeechClipCache();
  const pendingPlay = useRef<{
    text: string;
    nextClip: string | null;
    kind: "word" | "sentence";
  } | null>(null);
  const speakingKindRef = useRef<"word" | "sentence" | null>(null);
  const flippedRef = useRef(false);
  const hebrewRef = useRef<string | null>(null);
  const exampleAudioRef = useRef<string | null>(null);

  const card = queue[index];
  const cleared = Math.max(0, sessionTotal - new Set(queue.map((item) => item.id)).size);
  const usesRecordedAudio = cards.some((item) => item.audioUrl);
  flippedRef.current = flipped;
  phaseRef.current = phase;
  hebrewRef.current = card?.audioUrl ?? card?.hebrew ?? null;
  exampleAudioRef.current = card?.exampleAudioUrl || card?.hebrewExample || null;

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      const now = new Date();
      let memory = memoriesRef.current;

      try {
        const [{ signedIn: hasAccount, memory: saved }, experience] = await Promise.all([
          loadDeckMemory(deckId),
          loadExperience(),
        ]);
        if (cancelled) {
          return;
        }

        setSignedIn(hasAccount);
        memory = saved;
        memoriesRef.current = saved;
        experienceRef.current = experience.experience;
      } catch {
        if (cancelled) {
          return;
        }

        setSaveError(true);
      }

      const next = buildPlannedSession(cardsRef.current, memory, mode, count, now);
      if (mode === "trial") {
        trialIdsRef.current = next.map((card) => card.id);
        passRef.current = 1;
      }
      setQueue(next);
      setSessionTotal(next.length);
      if (next.length === 0 && cardsRef.current.length > 0) {
        phaseRef.current = "caught-up";
        setPhase("caught-up");
        setNextDue(soonestDue(Object.values(memory)));
      }

      if (next.length > 0) {
        try {
          await loadSessionSounds(next, () => cancelled);
        } catch {
          if (!cancelled) {
            setSpeechError(true);
          }
        }
      }

      if (!cancelled) {
        setReady(true);
      }
    }

    void prepare();

    return () => {
      cancelled = true;
      stopClip();
      disposeClips();
    };
  }, [count, deckId, mode]);

  useEffect(() => {
    if (!ready || mode !== "trial" || phase !== "study") {
      return;
    }

    const start = performance.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, TRIAL_SECONDS - (performance.now() - start) / 1000);
      setSecondsLeft(left);
      if (left <= 0) {
        window.clearInterval(id);
        endTrialRef.current();
      }
    }, 100);

    return () => window.clearInterval(id);
  }, [mode, phase, ready]);

  function sessionNeedsAudio(session: Flashcard[]) {
    return session.slice(0, MAX_STUDY_COUNT).some((item) => {
      const word = item.audioUrl ?? item.hebrew;
      const sentence = item.exampleAudioUrl || item.hebrewExample;
      return (
        (word.length > 0 && !clips.current.has(word)) ||
        (sentence.length > 0 && !clips.current.has(sentence))
      );
    });
  }

  async function preloadRecorded(url: string, isCancelled: () => boolean) {
    if (isCancelled() || clips.current.has(url)) {
      return;
    }

    const audio = new Audio(resolveLessonAudio(url));
    audio.preload = "auto";

    if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        audio.addEventListener("canplaythrough", done, { once: true });
        audio.addEventListener("error", done, { once: true });
        window.setTimeout(done, 20000);
      });
    }

    if (!isCancelled()) {
      clips.current.set(url, audio);
    }
  }

  async function loadSessionSounds(session: Flashcard[], isCancelled: () => boolean) {
    const upcoming = session.slice(0, MAX_STUDY_COUNT);
    const recorded = upcoming.flatMap((item) =>
      [item.audioUrl, item.exampleAudioUrl].filter((url): url is string => Boolean(url)),
    );
    const spoken = [
      ...new Set(
        upcoming.flatMap((item) => [
          item.audioUrl ? "" : item.hebrew,
          item.exampleAudioUrl ? "" : item.hebrewExample,
        ]),
      ),
    ].filter((text) => text.trim().length > 0);

    await Promise.all(recorded.map((url) => preloadRecorded(url, isCancelled)));
    if (isCancelled()) {
      return;
    }

    const texts = spoken.filter((text) => !clips.current.has(text)).slice(0, MAX_STUDY_COUNT * 2);
    await loadSpeechTexts(texts, isCancelled);
  }

  function playClip(text: string, nextClip: string | null, kind: "word" | "sentence") {
    if (!sound.allows(kind)) {
      pendingPlay.current = null;
      speakingKindRef.current = null;
      if (kind === "word" && nextClip && sound.allows("sentence")) {
        playClip(nextClip, null, "sentence");
      }
      return;
    }

    if (!clips.current.has(text) && isStoredAudio(text)) {
      const audio = new Audio(resolveLessonAudio(text));
      audio.preload = "auto";
      clips.current.set(text, audio);
    }

    const audio = clips.current.get(text);

    if (!audio) {
      pendingPlay.current = { text, nextClip, kind };
      if (usesRecordedAudio && !text.startsWith("/")) {
        void loadSpeechClip(text).then((loaded) => {
          if (!loaded) {
            if (pendingPlay.current?.text === text) {
              pendingPlay.current = null;
              speakingKindRef.current = null;
              setSpeakingClip(null);
              setSpeechError(true);
            }
            return;
          }
          clips.current.set(text, loaded);
          if (pendingPlay.current?.text === text) {
            playClip(text, pendingPlay.current.nextClip, pendingPlay.current.kind);
          }
        });
      }
      return;
    }

    pendingPlay.current = null;

    for (const clip of clips.current.values()) {
      clip.pause();
      clip.currentTime = 0;
    }

    audio.onended = () => {
      if (nextClip && hebrewIsShowing() && sound.allows("sentence")) {
        playClip(nextClip, null, "sentence");
        return;
      }

      speakingKindRef.current = null;
      setSpeakingClip((current) => (current === text ? null : current));
    };
    setSpeechError(false);
    speakingKindRef.current = kind;
    setSpeakingClip(text);
    void playAudio(audio).catch(() => {
      speakingKindRef.current = null;
      setSpeakingClip((current) => (current === text ? null : current));
      setSpeechError(true);
    });
  }

  function stopClip() {
    pendingPlay.current = null;
    speakingKindRef.current = null;
    stopClips();
    setSpeakingClip(null);
  }

  function hebrewIsShowing() {
    return prompt === "hebrew" ? !flippedRef.current : flippedRef.current;
  }

  function flip() {
    const next = !flippedRef.current;
    flippedRef.current = next;
    setFlipped(next);

    const showingHebrew = prompt === "hebrew" ? !next : next;

    const sentence = display.displayRef.current.example ? exampleAudioRef.current : null;

    if (showingHebrew && hebrewRef.current && sound.allows("word")) {
      playClip(hebrewRef.current, sentence, "word");
      return;
    }

    if (showingHebrew && sentence && sound.allows("sentence")) {
      playClip(sentence, null, "sentence");
      return;
    }

    stopClip();
  }

  function studiedSnapshot() {
    return [...studiedRef.current.values()].sort((a, b) => Number(b.missed) - Number(a.missed));
  }

  function refillTrial() {
    const byId = new Map(cardsRef.current.map((item) => [item.id, item]));
    const pass = passRef.current;
    passRef.current += 1;

    return shuffleIds(trialIdsRef.current).flatMap((id) => {
      const source = byId.get(id);
      if (!source) {
        return [];
      }

      return [
        {
          ...source,
          memory: memoriesRef.current[id] ?? freshMemory(),
          repeats: pass,
        },
      ];
    });
  }

  function finishStudy() {
    if (phaseRef.current === "done") {
      return;
    }

    endedRef.current = true;
    phaseRef.current = "done";
    setSummary(studiedSnapshot());
    setTrialStats({ correct: correctRef.current, best: bestRef.current });
    setPhase("done");
    setQueue([]);
    setIndex(0);
    stopClip();
    void finishSession();
  }

  endTrialRef.current = () => {
    if (phaseRef.current !== "study") {
      return;
    }

    finishStudy();
  };

  function applyGrade(grade: FlashcardGrade) {
    if (!card || phaseRef.current !== "study" || endedRef.current) {
      return;
    }

    const now = new Date();
    if (!baselinesRef.current.has(card.id)) {
      baselinesRef.current.set(card.id, card.memory);
    }
    const baseline = baselinesRef.current.get(card.id) ?? card.memory;
    const memory = gradeMemory(mode === "trial" ? baseline : card.memory, grade, now);
    const repeats = grade === "dontKnow" ? card.repeats + 1 : card.repeats;
    const updated = { ...card, memory, repeats };
    const previous = updatesRef.current.get(card.id);
    updatesRef.current.set(card.id, {
      mastery: memory.mastery,
      practices: (previous?.practices ?? 0) + 1,
      memory,
    });
    memoriesRef.current = { ...memoriesRef.current, [card.id]: memory };
    const studied = studiedRef.current.get(card.id);
    studiedRef.current.set(card.id, {
      id: card.id,
      english: card.english,
      hebrew: card.hebrew,
      partOfSpeech: card.partOfSpeech,
      from: studied?.from ?? baseline.mastery,
      to: memory.mastery,
      missed: (studied?.missed ?? false) || grade === "dontKnow",
    });
    if (mode === "trial") {
      if (grade === "dontKnow") {
        gainedRef.current += flashcardExperience[grade];
        multiplierRef.current = 1;
        setMultiplier(1);
      } else {
        gainedRef.current += flashcardExperience[grade] * multiplierRef.current;
        multiplierRef.current += 1;
        bestRef.current = Math.max(bestRef.current, multiplierRef.current);
        correctRef.current += 1;
        setMultiplier(multiplierRef.current);
      }
    } else {
      gainedRef.current += flashcardExperience[grade];
    }
    void recordDailyCards(1).then((result) => {
      if (result === "error") {
        setSaveError(true);
      }
    });
    const rest = queue.filter((_, itemIndex) => itemIndex !== index);
    const bringBack = mode !== "trial" && grade === "dontKnow" && returnsSoon(memory, now) && repeats < 3;

    setFlipped(false);
    flippedRef.current = false;
    setSpeechError(false);

    if (bringBack) {
      const nextQueue = [...rest, updated];
      setQueue(nextQueue);
      setIndex(index < rest.length ? index : 0);
      stopClip();
      return;
    }

    if (mode === "trial" && rest.length === 0) {
      const more = refillTrial();
      setQueue(more);
      setIndex(0);
      stopClip();
      return;
    }

    if (rest.length > 0) {
      setQueue(rest);
      setIndex(Math.min(index, rest.length - 1));
      stopClip();
      return;
    }

    finishStudy();
  }

  async function finishSession() {
    if (!rewardedRef.current) {
      rewardedRef.current = true;
      const from = experienceRef.current;
      const to = from + gainedRef.current;
      experienceRef.current = to;
      setReward({ from, to });
      const experienceResult = await addExperience(gainedRef.current);
      if (experienceResult === "error") {
        setSaveError(true);
      }
    }

    await persistSession();
  }

  async function persistSession() {
    if (savedRef.current) {
      return "ok" as const;
    }

    if (savingRef.current) {
      return savingRef.current;
    }

    const updates = [...updatesRef.current.entries()].map(([cardId, value]) => ({
      cardId,
      mastery: value.mastery,
      practices: value.practices,
      memory: value.memory,
    }));

    const request = saveSessionProgress(deckId, updates).then((result) => {
      if (result === "error") {
        setSaveError(true);
      } else {
        savedRef.current = true;
        setSaveError(false);
      }

      return result;
    });

    savingRef.current = request;
    setSaving(true);

    try {
      return await request;
    } finally {
      savingRef.current = null;
      setSaving(false);
    }
  }

  async function studyAgain() {
    const result = await persistSession();
    if (result === "error") {
      return;
    }

    updatesRef.current.clear();
    baselinesRef.current.clear();
    studiedRef.current.clear();
    gainedRef.current = 0;
    rewardedRef.current = false;
    savedRef.current = false;
    endedRef.current = false;
    multiplierRef.current = 1;
    bestRef.current = 1;
    correctRef.current = 0;
    setReward(null);
    setSummary([]);
    setMultiplier(1);
    setSecondsLeft(TRIAL_SECONDS);
    setTrialStats({ correct: 0, best: 1 });
    const now = new Date();
    const next = buildPlannedSession(cardsRef.current, memoriesRef.current, mode, count, now);
    if (mode === "trial") {
      trialIdsRef.current = next.map((item) => item.id);
      passRef.current = 1;
    }
    const caughtUp = next.length === 0 && cardsRef.current.length > 0;
    phaseRef.current = caughtUp ? "caught-up" : "study";
    setPhase(caughtUp ? "caught-up" : "study");
    setNextDue(caughtUp ? soonestDue(Object.values(memoriesRef.current)) : null);
    setQueue(next);
    setSessionTotal(next.length);
    setIndex(0);
    setFlipped(false);
    flippedRef.current = false;
    stopClip();
    setSpeechError(false);

    if (sessionNeedsAudio(next)) {
      setReady(false);
      try {
        await loadSessionSounds(next, () => false);
      } catch {
        setSpeechError(true);
      }
      setReady(true);
    }
  }

  function toggleSound(channel: SoundChannel) {
    const next = !sound.prefsRef.current[channel];
    sound.setChannel(channel, next);
    if (!next && (channel === "general" || channel === speakingKindRef.current)) {
      stopClip();
    }
  }

  function replay() {
    if (!hebrewIsShowing()) {
      return null;
    }

    const sentence = display.displayRef.current.example ? exampleAudioRef.current : null;

    if (hebrewRef.current && sound.allows("word")) {
      playClip(hebrewRef.current, sentence, "word");
      return "word" as const;
    }

    if (sentence && sound.allows("sentence")) {
      playClip(sentence, null, "sentence");
      return "sentence" as const;
    }

    return null;
  }

  function speak(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!card || !sound.allows("word")) {
      return;
    }

    playClip(card.audioUrl ?? card.hebrew, null, "word");
  }

  function speakExample(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const sentence = card?.exampleAudioUrl || card?.hebrewExample;
    if (!sentence || !sound.allows("sentence")) {
      return;
    }

    playClip(sentence, null, "sentence");
  }

  const Frame = embedded ? "section" : "main";

  return (
    <Frame className={embedded ? "flex min-h-[70vh] w-full flex-1 flex-col items-center" : "flex min-h-0 flex-1 flex-col items-center overflow-x-clip overflow-y-auto px-4 pt-2 pb-8 sm:px-8"}>
      <AccountNotice signedOut={signedIn === false} saveError={saveError} />
      {!ready ? (
        <ProgramLoader label={t("loadingProgram")} />
      ) : card ? (
        <StudyCardView
          card={card}
          flipped={flipped}
          speakingClip={speakingClip}
          speechError={speechError}
          soundPrefs={sound.prefs}
          onToggleSound={toggleSound}
          display={display.display}
          onToggleDisplay={display.toggle}
          completed={cleared}
          total={sessionTotal}
          onFlip={flip}
          onSpeak={speak}
          onSpeakExample={speakExample}
          onReplay={replay}
          onGrade={applyGrade}
          trial={mode === "trial" ? { secondsLeft, multiplier } : null}
          prompt={prompt}
        />
      ) : phase === "caught-up" ? (
        <LeafHeroScreen
          title={t("caughtUpTitle")}
          body={
            nextDue
              ? t("caughtUpBody", {
                  when: new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(nextDue)),
                })
              : t("caughtUpSoon")
          }
          actions={
            onExit ? (
              <Button type="button" variant="outline" size="lg" onClick={onExit}>
                {t("backToDeck")}
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg">
                <Link href={`/decks?deck=${deckId}&view=cards`}>{t("backToDeck")}</Link>
              </Button>
            )
          }
        />
      ) : cards.length === 0 ? (
        <LeafHeroScreen
          title={t("emptyDeck")}
          actions={
            onExit ? (
              <Button type="button" size="lg" onClick={onExit}>
                {t("backToDeck")}
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href={`/decks?deck=${deckId}&view=cards`}>{t("addCard")}</Link>
              </Button>
            )
          }
        />
      ) : (
        <SessionSummary
          title={mode === "trial" ? t("trialTitle") : t("completeTitle")}
          body={
            mode === "trial"
              ? t("trialResult", { correct: trialStats.correct, multiplier: trialStats.best })
              : t("completeBody")
          }
          cards={summary}
          reward={reward}
          saving={saving}
          deckId={deckId}
          onStudyAgain={() => void studyAgain()}
          onExit={onExit}
        />
      )}
    </Frame>
  );
}

function shuffleIds(ids: string[]) {
  const next = [...ids];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swap];
    next[swap] = current;
  }

  return next;
}
