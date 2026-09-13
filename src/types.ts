import type { ThemeId } from "./lib/rewards";

export type FeedbackKind = "idle" | "correct" | "correct-after-hint" | "wrong";

export type StageKind = "demo" | "guided" | "melody";

export type Screen =
  | "welcome"
  | "setup-pin"
  | "setup-kid"
  | "home"
  | "lesson"
  | "settings"
  | "calibrate";

export type InputSource = "mic" | "midi" | "screen";

export type NoteDuration = "quarter" | "half" | "whole" | "rest";

export type Hand = "right" | "left";

export interface LessonNote {
  midi: number | null;
  name: string;
  finger: number;
  duration?: NoteDuration;
  hand?: Hand;
}

export interface LessonStage {
  id: string;
  kind: StageKind;
  title: string;
  blurb: string;
  notes: LessonNote[];
}

export interface CourseUnit {
  id: string;
  courseId: string;
  title: string;
  subtitle: string;
  blurb: string;
  keyboard: "treble" | "wide";
  rhythm: boolean;
  stages: LessonStage[];
}

export interface KidProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
  lesson1Complete: boolean;
  xp: number;
  streakDays: number;
  lastPracticeDate: string | null;
  stageStars: Record<string, number>;
  unlockedRewards: string[];
  theme: ThemeId;
  sticker: string | null;
  badge: string | null;
}

export interface PersistedState {
  pinHash: string;
  pinSalt: string;
  pinKdf: string;
  pinLength: number;
  pinFailedAttempts: number;
  pinLockedUntil: number;
  sessionLimitMinutes: number;
  showFingerNumbers: boolean;
  calibrationCents: number;
  pathUnlocked: boolean;
  kids: KidProfile[];
  activeKidId: string | null;
}

export const AVATARS = ["🦊", "🐻", "🐰", "🐸", "🦉", "🐢", "🐱", "🐼"] as const;

export const EMPTY_KID_PROGRESS = {
  lesson1Complete: false,
  xp: 0,
  streakDays: 0,
  lastPracticeDate: null as string | null,
  stageStars: {} as Record<string, number>,
  unlockedRewards: [] as string[],
  theme: "cream" as ThemeId,
  sticker: null as string | null,
  badge: null as string | null,
};

export const DEFAULT_STATE: PersistedState = {
  pinHash: "",
  pinSalt: "",
  pinKdf: "",
  pinLength: 4,
  pinFailedAttempts: 0,
  pinLockedUntil: 0,
  sessionLimitMinutes: 15,
  showFingerNumbers: true,
  calibrationCents: 0,
  pathUnlocked: false,
  kids: [],
  activeKidId: null,
};

/** Color mapping used by the UI, tests, and README. */
export const FEEDBACK_COLORS = {
  correct: {
    label: "Correct",
    hex: "#2F8F5B",
    meaning: "Right note on the first try, before a hint was shown.",
  },
  "correct-after-hint": {
    label: "Correct after hint",
    hex: "#D4A017",
    meaning: "Right note after the target key hint was visible.",
  },
  wrong: {
    label: "Wrong",
    hex: "#C44B3C",
    meaning: "A different note. Practice mode stays on the same target.",
  },
} as const;
