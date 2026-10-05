import type { ThemeId } from "./lib/rewards";

export type FeedbackKind = "idle" | "correct" | "correct-after-hint" | "wrong";

export type StageKind = "demo" | "guided" | "melody";

export type Screen =
  | "welcome"
  | "setup-pin"
  | "setup-kid"
  | "home"
  | "library"
  | "lesson"
  | "settings"
  | "calibrate";

export type SongBand = "home-steps" | "neighbor-notes" | "steady-beats";

export type InputSource = "mic" | "midi" | "screen";

export type NoteDuration = "quarter" | "half" | "whole" | "rest";

export type Hand = "right" | "left";

export type Dynamic = "soft" | "loud";

/** The other hand's note, sounding at the same time as the main note. */
export interface TogetherPart {
  midi: number;
  name: string;
  finger: number;
  hand: Hand;
  duration?: NoteDuration;
}

export interface LessonNote {
  midi: number | null;
  name: string;
  finger: number;
  duration?: NoteDuration;
  hand?: Hand;
  /** When set, this pitch and `together` must be down at the same time. */
  together?: TogetherPart;
  /** Soft and loud are heard. A mismatch does not pass. */
  dynamic?: Dynamic;
}

export interface LessonStage {
  id: string;
  kind: StageKind;
  title: string;
  blurb: string;
  notes: LessonNote[];
}

/** One practice sitting inside a longer library piece. */
export interface SongSection {
  id: string;
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
  /** Practice hides the letter and the glowing key so the child reads the staff. */
  reading?: boolean;
  /** A quiet pulse. The note counts only when the pitch is close to the beat. */
  timing?: boolean;
  stages: LessonStage[];
}

/** A free-to-use teaching song encoded as an original Home Keys note sequence. */
export interface LibrarySong {
  id: string;
  title: string;
  composer: string;
  tradition: string;
  /** Short kid-facing reason this melody may be used here. */
  licenseNote: string;
  blurb: string;
  /** Course unit that must be finished (stars > 0) before this song unlocks. */
  unlockAfterUnitId: string;
  /**
   * Other songs that must be finished before this one opens.
   * A grown-up PIN unlock still skips this wait.
   */
  unlockAfterSongIds?: string[];
  /** Longer pieces can be practiced one section at a time. `notes` is every section in order. */
  sections?: SongSection[];
  band: SongBand;
  bandLabel: string;
  keyboard: "treble" | "wide";
  rhythm: boolean;
  notes: LessonNote[];
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
  /** Song ids a grown-up unlocked early with the PIN. */
  unlockedSongs: string[];
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
  libraryUnlocked: boolean;
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
  unlockedSongs: [] as string[],
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
  libraryUnlocked: false,
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
