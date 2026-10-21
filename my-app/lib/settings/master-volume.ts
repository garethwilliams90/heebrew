let level = 0.8;

export function masterVolume() {
  return level;
}

export function setMasterVolume(next: number) {
  level = Math.min(1, Math.max(0, next));
}

export function playAudio(audio: HTMLAudioElement) {
  audio.volume = level;
  return audio.play();
}
