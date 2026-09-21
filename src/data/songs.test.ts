import { describe, expect, it } from "vitest";
import { WHITE_KEYS_C4_TO_C5 } from "../audio/notes";
import { isCourseUnitId, playableById } from "./playable";
import { LIBRARY_SONGS, songToUnit } from "./songs";

const BANNED =
  /simply piano|disney|let it go|frozen|musescore|video.?game|beer|wine|drinking|battle hymn|war song|halloween|horror|kiss me|sexy/i;

const TREBLE = new Set<number>(WHITE_KEYS_C4_TO_C5);

describe("song library catalog", () => {
  it("includes at least eight kid-safe public-domain teaching songs", () => {
    expect(LIBRARY_SONGS.length).toBeGreaterThanOrEqual(8);
    expect(LIBRARY_SONGS.length).toBeLessThanOrEqual(16);
  });

  it("keeps songs out of the original course path", () => {
    for (const song of LIBRARY_SONGS) {
      expect(isCourseUnitId(song.id)).toBe(false);
      expect(song.id.startsWith("song-")).toBe(true);
    }
  });

  it("documents title, composer, tradition, license, and a stage gate", () => {
    const ids = new Set<string>();
    for (const song of LIBRARY_SONGS) {
      expect(ids.has(song.id)).toBe(false);
      ids.add(song.id);
      expect(song.title.length).toBeGreaterThan(3);
      expect(song.composer.length).toBeGreaterThan(3);
      expect(song.tradition.length).toBeGreaterThan(3);
      expect(song.licenseNote).toMatch(/PD|public domain|traditional/i);
      expect(song.licenseNote).toMatch(/Home Keys|arrangement/i);
      expect(song.unlockAfterUnitId).toMatch(/basics-five|neighbors-abc|rhythm-beats/);
      expect(song.notes.length).toBeGreaterThanOrEqual(8);
      expect(song.title).not.toMatch(BANNED);
      expect(song.blurb).not.toMatch(BANNED);
      expect(song.licenseNote).not.toMatch(BANNED);
    }
  });

  it("encodes only treble C4–C5 white keys matching the on-screen keyboard", () => {
    for (const song of LIBRARY_SONGS) {
      expect(song.keyboard).toBe("treble");
      for (const item of song.notes) {
        expect(item.midi).not.toBeNull();
        expect(TREBLE.has(item.midi as number)).toBe(true);
        expect(item.name).toMatch(/^[A-G]$/);
        expect(item.finger).toBeGreaterThanOrEqual(1);
        expect(item.hand).toBe("right");
      }
    }
  });

  it("wraps each song as demo then wait-for-correct melody practice", () => {
    for (const song of LIBRARY_SONGS) {
      const unit = songToUnit(song);
      expect(unit.courseId).toBe("library");
      expect(unit.stages.map((stage) => stage.kind)).toEqual(["demo", "melody"]);
      expect(unit.stages[1].notes).toEqual(song.notes);
      expect(playableById(song.id).id).toBe(song.id);
    }
  });

  it("includes the suggested starter set (simplified)", () => {
    const titles = LIBRARY_SONGS.map((song) => song.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Ode to Joy",
        "Twinkle Twinkle",
        "Minuet in G",
        "Hot Cross Buns",
        "Mary Had a Little Lamb",
        "Canon (simplified)",
        "Eine Kleine Nachtmusik",
        "Spring (motif)",
        "Brahms Lullaby",
      ]),
    );
  });
});
