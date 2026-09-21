import type { KidProfile } from "../types";
import { newlyUnlocked, rewardsForLevel } from "./rewards";

export const XP_PER_STAGE = 50;
export const XP_PER_STAR = 10;
export const XP_PER_LEVEL = 100;

export function starsFromCounts(wrongs: number, scoredNotes: number): 1 | 2 | 3 {
  if (scoredNotes <= 0) return 1;
  if (wrongs <= 0) return 3;
  if (wrongs <= Math.ceil(scoredNotes / 2)) return 2;
  return 1;
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
}

export function xpBar(xp: number): { level: number; current: number; needed: number } {
  const level = levelFromXp(xp);
  return { level, current: Math.max(0, xp) % XP_PER_LEVEL, needed: XP_PER_LEVEL };
}

export function todayStamp(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function yesterdayStamp(today: string): string {
  const date = new Date(`${today}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function nextPracticeStreak(
  lastPracticeDate: string | null,
  streakDays: number,
  today: string,
): { streakDays: number; lastPracticeDate: string } {
  if (lastPracticeDate === today) {
    return { streakDays: Math.max(1, streakDays), lastPracticeDate: today };
  }
  if (lastPracticeDate === yesterdayStamp(today)) {
    return { streakDays: Math.max(0, streakDays) + 1, lastPracticeDate: today };
  }
  return { streakDays: 1, lastPracticeDate: today };
}

export function isUnitUnlocked(
  unitId: string,
  unitOrder: string[],
  stars: Record<string, number>,
  unlockAll: boolean,
): boolean {
  if (unlockAll) return true;
  const index = unitOrder.indexOf(unitId);
  if (index < 0) return false;
  if (index === 0) return true;
  return (stars[unitOrder[index - 1]] ?? 0) > 0;
}

export interface SongUnlockOptions {
  stars: Record<string, number>;
  pathUnlocked: boolean;
  libraryUnlocked: boolean;
  parentUnlockedSongs: string[];
}

export function isSongUnlocked(
  unlockAfterUnitId: string,
  songId: string,
  options: SongUnlockOptions,
): boolean {
  if (options.pathUnlocked || options.libraryUnlocked) return true;
  if (options.parentUnlockedSongs.includes(songId)) return true;
  return (options.stars[unlockAfterUnitId] ?? 0) > 0;
}

export interface StageAward {
  kid: KidProfile;
  stars: 1 | 2 | 3;
  xpGained: number;
  leveledUp: boolean;
  newRewards: string[];
}

export function applyStageComplete(
  kid: KidProfile,
  unitId: string,
  stars: 1 | 2 | 3,
  today = todayStamp(),
): StageAward {
  const previousStars = kid.stageStars[unitId] ?? 0;
  const firstFinish = previousStars === 0;
  const best = Math.max(previousStars, stars) as 1 | 2 | 3;
  let xpGained = 0;
  if (firstFinish) xpGained += XP_PER_STAGE + stars * XP_PER_STAR;
  else if (best > previousStars) xpGained += (best - previousStars) * XP_PER_STAR;

  const xp = kid.xp + xpGained;
  const beforeLevel = levelFromXp(kid.xp);
  const afterLevel = levelFromXp(xp);
  const unlocked = new Set(kid.unlockedRewards);
  const fresh = newlyUnlocked(beforeLevel, afterLevel);
  for (const reward of fresh) unlocked.add(reward.id);
  for (const reward of rewardsForLevel(afterLevel)) unlocked.add(reward.id);

  const streak = nextPracticeStreak(kid.lastPracticeDate, kid.streakDays, today);

  const next: KidProfile = {
    ...kid,
    lesson1Complete: kid.lesson1Complete || unitId === "basics-five",
    xp,
    stageStars: { ...kid.stageStars, [unitId]: best },
    unlockedRewards: [...unlocked],
    ...streak,
  };

  return {
    kid: next,
    stars: best,
    xpGained,
    leveledUp: afterLevel > beforeLevel,
    newRewards: fresh.map((reward) => reward.id),
  };
}
