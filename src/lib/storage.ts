import { DEFAULT_STATE, EMPTY_KID_PROGRESS, type KidProfile, type PersistedState } from "../types";
import { levelFromXp } from "./progress";
import { rewardsForLevel } from "./rewards";

export const STORAGE_KEY = "home-keys-v1";

export function migrateKid(raw: Partial<KidProfile>): KidProfile {
  const lesson1Complete = Boolean(raw.lesson1Complete);
  const stageStars = { ...(raw.stageStars ?? {}) };
  const backfillBasics = lesson1Complete && !stageStars["basics-five"];
  if (backfillBasics) stageStars["basics-five"] = 2;
  const xp = backfillBasics && !(raw.xp && raw.xp > 0) ? 70 : (raw.xp ?? (stageStars["basics-five"] ? 70 : 0));
  const unlocked = new Set(raw.unlockedRewards ?? []);
  for (const reward of rewardsForLevel(levelFromXp(xp))) unlocked.add(reward.id);

  return {
    id: raw.id ?? "kid",
    name: raw.name ?? "Friend",
    avatar: raw.avatar ?? "🦊",
    createdAt: raw.createdAt ?? new Date().toISOString(),
    ...EMPTY_KID_PROGRESS,
    ...raw,
    lesson1Complete,
    xp,
    stageStars,
    unlockedRewards: [...unlocked],
    theme: raw.theme ?? "cream",
    sticker: raw.sticker ?? null,
    badge: raw.badge ?? null,
    streakDays: raw.streakDays ?? 0,
    lastPracticeDate: raw.lastPracticeDate ?? null,
  };
}

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE, kids: [] };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const pinLength = parsed.pinLength || (parsed.pinHash ? 4 : 4);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      pinLength,
      kids: Array.isArray(parsed.kids) ? parsed.kids.map((kid) => migrateKid(kid)) : [],
    };
  } catch {
    return { ...DEFAULT_STATE, kids: [] };
  }
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
