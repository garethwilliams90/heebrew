import { letterConsonantSrc } from "@/lib/learn/consonant-sounds";
import { loadBundleClip } from "@/lib/learn/bundle-clip";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { playAudio } from "@/lib/settings/master-volume";

export async function playStudyClip(item: { hebrew: string; say?: string; audio?: string; letterId?: string }) {
  if (item.letterId) {
    const src = letterConsonantSrc(item.letterId);
    if (src) {
      await playAudio(new Audio(src));
      return;
    }
  }

  if (item.audio) {
    const clip = await loadBundleClip(item.audio);
    if (clip) {
      clip.currentTime = 0;
      await playAudio(clip);
      return;
    }
  }

  const speech = await loadSpeechClip(item.say || item.hebrew);
  if (!speech) {
    return;
  }
  speech.currentTime = 0;
  await playAudio(speech);
}
