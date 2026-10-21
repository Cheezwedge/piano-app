import type { Screen } from "../types";

export function sessionExpired(
  startedAt: number | null,
  limitMinutes: number,
  now: number,
): boolean {
  if (startedAt == null || limitMinutes <= 0) return false;
  return now - startedAt >= limitMinutes * 60 * 1000;
}

export function isKidFacingScreen(screen: Screen): boolean {
  return screen === "home" || screen === "library" || screen === "lesson";
}

export function sessionShouldRun(activeKidId: string | null, pinHash: string): boolean {
  return Boolean(activeKidId && pinHash);
}

/** Milliseconds left on the kid session, or null when no limit is running. */
export function sessionRemainingMs(
  startedAt: number | null,
  limitMinutes: number,
  now: number,
  active: boolean,
): number | null {
  if (!active || limitMinutes <= 0 || startedAt == null) return null;
  return Math.max(0, limitMinutes * 60 * 1000 - (now - startedAt));
}

export function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
