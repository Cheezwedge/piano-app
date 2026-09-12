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

export interface LessonNote {
  midi: number;
  name: string;
  finger: number;
}

export interface LessonStage {
  id: string;
  kind: StageKind;
  title: string;
  blurb: string;
  notes: LessonNote[];
}

export interface KidProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
  lesson1Complete: boolean;
}

export interface PersistedState {
  pinHash: string;
  sessionLimitMinutes: number;
  showFingerNumbers: boolean;
  calibrationCents: number;
  kids: KidProfile[];
  activeKidId: string | null;
}

export const AVATARS = ["🦊", "🐻", "🐰", "🐸", "🦉", "🐢", "🐱", "🐼"] as const;

export const DEFAULT_STATE: PersistedState = {
  pinHash: "",
  sessionLimitMinutes: 15,
  showFingerNumbers: true,
  calibrationCents: 0,
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
