import type { SpeechCue } from "@/lib/alephbet/intro-alphabet";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { playAudio } from "@/lib/settings/master-volume";

export async function playCue(cue: SpeechCue) {
  const audio = await loadSpeechClip(cue.text, cue.phoneme);
  if (!audio) {
    return;
  }
  audio.currentTime = 0;
  await playAudio(audio);
}
