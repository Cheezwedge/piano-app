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
