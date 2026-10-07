"use client";

import { useEffect, useRef, useState } from "react";
import { Leaf } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProgramLoader } from "@/components/program-loader";
import { AccountNotice } from "@/components/flashcards/account-notice";
import { ExperienceAward } from "@/components/flashcards/experience-award";
import { useSoundPrefs, type SoundChannel } from "@/components/flashcards/sound-toggle";
import { StudyCardView, type StudyCard } from "@/components/flashcards/study-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { prepareSpeechClip, requestDeckSpeech } from "@/lib/flashcards/deck-speech";
import { recordDailyCards } from "@/lib/flashcards/daily-practice";
import { addExperience, gradeExperience, loadExperience } from "@/lib/flashcards/experience";
import { loadDeckMastery, saveSessionProgress } from "@/lib/flashcards/progress";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { buildStudySession, nextMastery } from "@/lib/flashcards/review";
import type { Flashcard, RecallGrade } from "@/lib/flashcards/types";

type StudyPhase = "learn" | "review" | "done";

export function FlashcardSession({
  deckId,
  cards,
}: {
  deckId: string;
  cards: Flashcard[];
}) {
  const t = useTranslations("Flashcards");
  const sound = useSoundPrefs();
  const cardsRef = useRef(cards);
  const masteryRef = useRef<Record<string, number>>({});
  const updatesRef = useRef(new Map<string, { mastery: number; practices: number }>());
  const weakRef = useRef<StudyCard[]>([]);
  const phaseRef = useRef<StudyPhase>("learn");
  const experienceRef = useRef(0);
  const gainedRef = useRef(0);
  const rewardedRef = useRef(false);
  const savedRef = useRef(false);
  const savingRef = useRef<Promise<"ok" | "signed-out" | "error"> | null>(null);
  const [queue, setQueue] = useState<StudyCard[]>([]);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [learnTotal, setLearnTotal] = useState(0);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [speakingClip, setSpeakingClip] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState<StudyPhase>("learn");
  const [reward, setReward] = useState<{ from: number; to: number } | null>(null);
  const clips = useRef(new Map<string, HTMLAudioElement>());
  const clipUrls = useRef<string[]>([]);
  const pendingPlay = useRef<{
    text: string;
    nextClip: string | null;
    kind: "word" | "sentence";
  } | null>(null);
  const speakingKindRef = useRef<"word" | "sentence" | null>(null);
  const hasCard = useRef(false);
  const flippedRef = useRef(false);
  const hebrewRef = useRef<string | null>(null);
  const exampleAudioRef = useRef<string | null>(null);

  const card = queue[index];
  const usesRecordedAudio = cards.some((item) => item.audioUrl);
  hasCard.current = Boolean(card);
  flippedRef.current = flipped;
  hebrewRef.current = card?.audioUrl ?? card?.hebrew ?? null;
  exampleAudioRef.current = card?.exampleAudioUrl || card?.hebrewExample || null;

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      let next = buildStudySession(cardsRef.current, masteryRef.current);

      try {
        const [{ signedIn: hasAccount, mastery }, experience] = await Promise.all([
          loadDeckMastery(deckId),
          loadExperience(),
        ]);
        if (cancelled) {
          return;
        }

        setSignedIn(hasAccount);
        masteryRef.current = mastery;
        experienceRef.current = experience.experience;
        next = buildStudySession(cardsRef.current, mastery);
      } catch {
        if (cancelled) {
          return;
        }

        setSaveError(true);
      }

      setQueue(next);
      setSessionTotal(next.length);
      setLearnTotal(next.length);

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
      clips.current.clear();
      for (const url of clipUrls.current) {
        URL.revokeObjectURL(url);
      }
      clipUrls.current = [];
    };
  }, [deckId]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== " " && event.code !== "Space") {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("button, a, input, textarea, select")
      ) {
        return;
      }

      if (!hasCard.current) {
        return;
      }

      event.preventDefault();
      flip();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function sessionNeedsAudio(session: Flashcard[]) {
    return session.some((item) => {
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

    const audio = new Audio(url);
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
    const recorded = session.flatMap((item) =>
      [item.audioUrl, item.exampleAudioUrl].filter((url): url is string => Boolean(url)),
    );
    const spoken = [
      ...new Set(
        session.flatMap((item) => [
          item.audioUrl ? "" : item.hebrew,
          item.exampleAudioUrl ? "" : item.hebrewExample,
        ]),
      ),
    ].filter((text) => text.trim().length > 0);

    await Promise.all(recorded.map((url) => preloadRecorded(url, isCancelled)));
    if (isCancelled()) {
      return;
    }

    const texts = spoken.filter((text) => !clips.current.has(text)).slice(0, 40);
    if (texts.length === 0) {
      return;
    }

    const clipsForDeck = await requestDeckSpeech(texts);
    if (isCancelled()) {
      return;
    }

    await Promise.all(
      clipsForDeck.map(async (clip) => {
        if (clips.current.has(clip.text)) {
          return;
        }

        const { url, audio } = await prepareSpeechClip(clip.audio);
        if (isCancelled()) {
          URL.revokeObjectURL(url);
          return;
        }

        clipUrls.current.push(url);
        clips.current.set(clip.text, audio);
      }),
    );
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

    if (!clips.current.has(text) && text.startsWith("/deck-media/")) {
      const audio = new Audio(text);
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
    void audio.play().catch(() => {
      speakingKindRef.current = null;
      setSpeakingClip((current) => (current === text ? null : current));
      setSpeechError(true);
    });
  }

  function stopClip() {
    pendingPlay.current = null;
    speakingKindRef.current = null;

    for (const clip of clips.current.values()) {
      clip.onended = null;
      clip.pause();
      clip.currentTime = 0;
    }

    setSpeakingClip(null);
  }

  function hebrewIsShowing() {
    return phaseRef.current === "review" ? !flippedRef.current : flippedRef.current;
  }

  function flip() {
    const next = !flippedRef.current;
    flippedRef.current = next;
    setFlipped(next);

    const showingHebrew = phaseRef.current === "review" ? !next : next;

    if (showingHebrew && hebrewRef.current && sound.allows("word")) {
      playClip(hebrewRef.current, exampleAudioRef.current, "word");
      return;
    }

    if (showingHebrew && exampleAudioRef.current && sound.allows("sentence")) {
      playClip(exampleAudioRef.current, null, "sentence");
      return;
    }

    stopClip();
  }

  function speakCard(item: StudyCard) {
    playClip(item.audioUrl ?? item.hebrew, item.exampleAudioUrl ?? null, "word");
  }

  function applyGrade(grade: RecallGrade) {
    if (!card) {
      return;
    }

    const updated = { ...card, mastery: nextMastery(card.mastery, grade) };
    const previous = updatesRef.current.get(card.id);
    updatesRef.current.set(card.id, {
      mastery: updated.mastery,
      practices: (previous?.practices ?? 0) + 1,
    });
    masteryRef.current = { ...masteryRef.current, [card.id]: updated.mastery };
    gainedRef.current += gradeExperience[grade];
    void recordDailyCards(1).then((result) => {
      if (result === "error") {
        setSaveError(true);
      }
    });
    const rest = queue.filter((_, itemIndex) => itemIndex !== index);

    if (phaseRef.current === "learn" && (grade === "dontKnow" || grade === "know")) {
      weakRef.current.push(updated);
    }

    setFlipped(false);
    flippedRef.current = false;
    setSpeechError(false);

    if (rest.length > 0) {
      const nextIndex = Math.min(index, rest.length - 1);
      setCompleted((count) => count + 1);
      setQueue(rest);
      setIndex(nextIndex);
      if (phaseRef.current === "review") {
        speakCard(rest[nextIndex]);
      } else {
        stopClip();
      }
      return;
    }

    if (phaseRef.current === "learn" && weakRef.current.length > 0) {
      const review = [...weakRef.current].reverse();
      weakRef.current = [];
      phaseRef.current = "review";
      setPhase("review");
      setQueue(review);
      setSessionTotal(review.length);
      setIndex(0);
      setCompleted(0);
      speakCard(review[0]);
      return;
    }

    phaseRef.current = "done";
    setPhase("done");
    setCompleted((count) => count + 1);
    setQueue(rest);
    setIndex(0);
    stopClip();
    void finishSession();
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
    weakRef.current = [];
    gainedRef.current = 0;
    rewardedRef.current = false;
    savedRef.current = false;
    phaseRef.current = "learn";
    setPhase("learn");
    setReward(null);
    const next = buildStudySession(cardsRef.current, masteryRef.current);
    setQueue(next);
    setSessionTotal(next.length);
    setLearnTotal(next.length);
    setIndex(0);
    setCompleted(0);
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

  function setFamiliarity(level: number) {
    if (!card) {
      return;
    }

    const graded = updatesRef.current.get(card.id);
    if (graded) {
      updatesRef.current.set(card.id, { ...graded, mastery: level });
    }

    masteryRef.current = { ...masteryRef.current, [card.id]: level };
    setQueue((current) =>
      current.map((item) => (item.id === card.id ? { ...item, mastery: level } : item)),
    );
  }

  function toggleSound(channel: SoundChannel) {
    const next = !sound.prefsRef.current[channel];
    sound.setChannel(channel, next);
    if (!next && (channel === "general" || channel === speakingKindRef.current)) {
      stopClip();
    }
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

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-10 sm:px-8">
      <AccountNotice signedOut={signedIn === false} saveError={saveError} />
      {!ready ? (
        <ProgramLoader label={t("loadingProgram")} />
      ) : card ? (
        <StudyCardView
          card={card}
          flipped={flipped}
          prompt={phase === "review" ? "hebrew" : "english"}
          speakingClip={speakingClip}
          speechError={speechError}
          soundPrefs={sound.prefs}
          onToggleSound={toggleSound}
          completed={phase === "review" ? learnTotal : completed}
          total={learnTotal}
          reviewCompleted={phase === "review" ? completed : 0}
          reviewTotal={phase === "review" ? sessionTotal : 0}
          progressLabel={phase === "review" ? "reviewProgress" : "progress"}
          onFlip={flip}
          onSpeak={speak}
          onSpeakExample={speakExample}
          onFamiliarity={setFamiliarity}
          onGrade={applyGrade}
        />
      ) : cards.length === 0 ? (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <Leaf className="mb-4 size-8 text-emerald-800" aria-hidden />
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("emptyDeck")}</h1>
          <Button asChild size="lg" className="mt-8">
            <Link href={`/decks?deck=${deckId}&view=cards`}>{t("addCard")}</Link>
          </Button>
        </section>
      ) : (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <Leaf className="mb-4 size-8 text-emerald-800" aria-hidden />
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">
            {t("completeTitle")}
          </h1>
          <p className="mt-3 max-w-sm text-emerald-900/70">{t("completeBody")}</p>
          {reward ? <ExperienceAward from={reward.from} to={reward.to} /> : null}
          <Button size="lg" className="mt-8" disabled={saving} onClick={studyAgain}>
            {t("studyAgain")}
          </Button>
        </section>
      )}
    </main>
  );
}
