import type { RefObject } from "react";

export function armAfterSpeech(
  play: () => void | Promise<void>,
  armTimer: RefObject<number | null>,
  onArm: () => void,
  isCurrent: () => boolean = () => true,
) {
  if (armTimer.current !== null) {
    window.clearTimeout(armTimer.current);
    armTimer.current = null;
  }

  const started = Date.now();
  void Promise.resolve(play()).finally(() => {
    if (!isCurrent()) {
      return;
    }
    const wait = Math.max(0, 500 - (Date.now() - started));
    armTimer.current = window.setTimeout(() => {
      if (isCurrent()) {
        onArm();
      }
    }, wait);
  });
}
