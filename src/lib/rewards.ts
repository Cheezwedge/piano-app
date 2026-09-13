export type ThemeId = "cream" | "sky" | "meadow" | "dusk";
export type RewardKind = "sticker" | "theme" | "badge";

export interface Reward {
  id: string;
  kind: RewardKind;
  name: string;
  emoji: string;
  level: number;
  theme?: ThemeId;
}

export const REWARDS: Reward[] = [
  { id: "sticker-seed", kind: "sticker", name: "Sunny Seed", emoji: "🌻", level: 2 },
  { id: "theme-sky", kind: "theme", name: "Sky Quilt", emoji: "🌤️", level: 3, theme: "sky" },
  { id: "badge-star", kind: "badge", name: "First Star", emoji: "⭐", level: 4 },
  { id: "theme-meadow", kind: "theme", name: "Meadow Tea", emoji: "🌿", level: 5, theme: "meadow" },
  { id: "sticker-boat", kind: "sticker", name: "Paper Boat", emoji: "⛵", level: 6 },
  { id: "theme-dusk", kind: "theme", name: "Dusk Lamp", emoji: "🌙", level: 7, theme: "dusk" },
  { id: "badge-clef", kind: "badge", name: "House Clef", emoji: "🏠", level: 8 },
];

export function rewardsForLevel(level: number): Reward[] {
  return REWARDS.filter((reward) => reward.level <= level);
}

export function newlyUnlocked(beforeLevel: number, afterLevel: number): Reward[] {
  return REWARDS.filter((reward) => reward.level > beforeLevel && reward.level <= afterLevel);
}
