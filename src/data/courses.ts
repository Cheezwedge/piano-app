import type { CourseUnit, LessonNote } from "../types";
import { C, D, E, F, G, LESSON_1_STAGES, note } from "./lesson1";

const A = note(9, "A", 5);
const B = note(11, "B", 4);
const C5 = note(12, "C", 5);

const C3: LessonNote = { midi: 48, name: "C", finger: 5, duration: "quarter", hand: "left" };
const G3: LessonNote = { midi: 55, name: "G", finger: 1, duration: "quarter", hand: "left" };

function withDuration(source: LessonNote, duration: LessonNote["duration"]): LessonNote {
  return { ...source, duration };
}

const REST: LessonNote = { midi: null, name: "Rest", finger: 0, duration: "rest", hand: "right" };

/** Porch Light — original neighbor-note tune. C major, no licensed melody. */
const PORCH_LIGHT = [C, E, G, A, G, E, D, C];

/** Quiet Clock — original rhythm walk. */
const QUIET_CLOCK = [
  withDuration(C, "quarter"),
  withDuration(D, "quarter"),
  withDuration(E, "half"),
  REST,
  withDuration(F, "quarter"),
  withDuration(G, "half"),
  withDuration(E, "quarter"),
  withDuration(C, "whole"),
];

/** Low Door — original two-hand hello. Sequential, not a copyrighted bass line. */
const LOW_DOOR = [C3, G3, C, E, G, E, C, C3];

export const COURSE_UNITS: CourseUnit[] = [
  {
    id: "basics-five",
    courseId: "basics",
    title: "Home Steps",
    subtitle: "C D E F G",
    blurb: "Read the first five treble notes and walk Garden Walk.",
    keyboard: "treble",
    rhythm: false,
    stages: LESSON_1_STAGES,
  },
  {
    id: "neighbors-abc",
    courseId: "neighbors",
    title: "Neighbor Notes",
    subtitle: "A B and high C",
    blurb: "Step to the next-door notes in C major.",
    keyboard: "treble",
    rhythm: false,
    stages: [
      {
        id: "demo",
        kind: "demo",
        title: "Meet the neighbors",
        blurb: "A sits in the second space. B sits on the third line. High C sits in the third space.",
        notes: [G, A, B, C5],
      },
      {
        id: "guided",
        kind: "guided",
        title: "Find A, B, and C",
        blurb: "Play each glowing neighbor. We wait for the matching key.",
        notes: [A, B, C5, A, G],
      },
      {
        id: "melody",
        kind: "melody",
        title: "Porch Light",
        blurb: "An original Home Keys tune using C E G A and the notes you already know.",
        notes: PORCH_LIGHT,
      },
    ],
  },
  {
    id: "rhythm-beats",
    courseId: "rhythm",
    title: "Steady Beats",
    subtitle: "Quarter, half, whole, rest",
    blurb: "Hold the right key for the right kind of beat. Rests ask for quiet.",
    keyboard: "treble",
    rhythm: true,
    stages: [
      {
        id: "demo",
        kind: "demo",
        title: "Meet the beats",
        blurb: "A quarter is short, a half lasts two counts, a whole lasts four, and a rest is a quiet count.",
        notes: [withDuration(C, "quarter"), withDuration(E, "half"), withDuration(G, "whole"), REST],
      },
      {
        id: "guided",
        kind: "guided",
        title: "Hold and rest",
        blurb: "Play the pitch, then wait through the beat. For a rest, stay quiet until it passes.",
        notes: [withDuration(C, "quarter"), withDuration(E, "half"), REST, withDuration(G, "whole")],
      },
      {
        id: "melody",
        kind: "melody",
        title: "Quiet Clock",
        blurb: "An original ticking walk. Hints stay hidden until you ask.",
        notes: QUIET_CLOCK,
      },
    ],
  },
  {
    id: "twohands-hello",
    courseId: "twohands",
    title: "Two Hands Hello",
    subtitle: "Left-hand C and G",
    blurb: "A very light left-hand hello: low C, then G, then a right-hand wave.",
    keyboard: "wide",
    rhythm: false,
    stages: [
      {
        id: "demo",
        kind: "demo",
        title: "Low door, high window",
        blurb: "Left hand plays low C and G (an open fifth). Right hand answers on the familiar treble notes.",
        notes: [C3, G3, C, E],
      },
      {
        id: "guided",
        kind: "guided",
        title: "Left then right",
        blurb: "Play the glowing key. Left-hand keys sit on the lower part of the keyboard.",
        notes: [C3, G3, C, E, G],
      },
      {
        id: "melody",
        kind: "melody",
        title: "Low Door",
        blurb: "An original call-and-answer. No licensed bass lines — just a door downstairs and a window up top.",
        notes: LOW_DOOR,
      },
    ],
  },
];

export const UNIT_ORDER = COURSE_UNITS.map((unit) => unit.id);

export function unitById(id: string): CourseUnit {
  return COURSE_UNITS.find((unit) => unit.id === id) ?? COURSE_UNITS[0];
}
