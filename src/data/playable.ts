import type { CourseUnit } from "../types";
import { COURSE_UNITS, unitById } from "./courses";
import { isLibrarySongId, songById, songToUnit } from "./songs";

export function playableById(id: string): CourseUnit {
  if (isLibrarySongId(id)) {
    const song = songById(id);
    if (song) return songToUnit(song);
  }
  return unitById(id);
}

export function isCourseUnitId(id: string): boolean {
  return COURSE_UNITS.some((unit) => unit.id === id);
}
