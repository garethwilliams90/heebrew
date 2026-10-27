export const PLAYBACK_RATES = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2] as const;

export const SKIP_SECONDS = [15, 5] as const;

export function nearestRate(value: number) {
  const clamped = Math.min(2, Math.max(0.5, value));
  return Math.round(clamped * 10) / 10;
}

export function nextTime(current: number, delta: number, duration: number | null) {
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const target = safeCurrent + delta;
  const upper = duration != null && Number.isFinite(duration) && duration > 0 ? duration : Number.POSITIVE_INFINITY;
  return Math.min(upper, Math.max(0, target));
}

export function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}:${remain.toString().padStart(2, "0")}`;
}
