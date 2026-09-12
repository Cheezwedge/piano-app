import { C4_MIDI } from "../audio/notes";
import type { LessonNote, LessonStage } from "../types";

function note(offset: number, name: string, finger: number): LessonNote {
  return { midi: C4_MIDI + offset, name, finger };
}

const C = note(0, "C", 1);
const D = note(2, "D", 2);
const E = note(4, "E", 3);
const F = note(5, "F", 4);
const G = note(7, "G", 5);

const FIVE_NOTES = [C, D, E, F, G];

/** Original five-note walk written for Home Keys. Not a copyrighted tune. */
const GARDEN_WALK = [C, D, E, D, E, F, E, D, C];

export const LESSON_1_STAGES: LessonStage[] = [
  {
    id: "demo",
    kind: "demo",
    title: "Meet the notes",
    blurb: "Watch and listen. These five notes live around middle C on the treble staff.",
    notes: FIVE_NOTES,
  },
  {
    id: "guided",
    kind: "guided",
    title: "Find each key",
    blurb: "Play the glowing key. We wait here until the matching note is heard.",
    notes: FIVE_NOTES,
  },
  {
    id: "melody",
    kind: "melody",
    title: "Garden Walk",
    blurb: "A tiny original melody using only C D E F G. Hints stay hidden until you ask — or after a short wait.",
    notes: GARDEN_WALK,
  },
];

export const LESSON_1 = {
  id: "lesson-1",
  title: "Lesson 1 · First five notes",
  subtitle: "Treble C D E F G",
  stages: LESSON_1_STAGES,
};
