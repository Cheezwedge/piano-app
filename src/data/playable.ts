import type { CourseUnit } from "../types";
import { COURSE_UNITS, unitById } from "./courses";
import { isLibrarySongId, songById, songToUnit } from "./songs";

const PLAYABLE_CACHE = new Map<string, CourseUnit>();

export function playableById(id: string): CourseUnit {
  const cached = PLAYABLE_CACHE.get(id);
  if (cached) return cached;

  let unit: CourseUnit;
  if (isLibrarySongId(id)) {
    const song = songById(id);
    unit = song ? songToUnit(song) : unitById(id);
  } else {
    unit = unitById(id);
  }
  PLAYABLE_CACHE.set(id, unit);
  return unit;
}

export function isCourseUnitId(id: string): boolean {
  return COURSE_UNITS.some((unit) => unit.id === id);
}
