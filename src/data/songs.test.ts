import { describe, expect, it } from "vitest";
import { WHITE_KEYS_C4_TO_C5 } from "../audio/notes";
import { isCourseUnitId, playableById } from "./playable";
import { HOME_STEPS_FIRST_SONG_IDS, LIBRARY_SONGS, songById, songPacingLabel, songToUnit } from "./songs";

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

  it("wraps each song as a demo then wait-for-correct practice", () => {
    for (const song of LIBRARY_SONGS) {
      const unit = songToUnit(song);
      expect(unit.courseId).toBe("library");
      expect(unit.stages[0]?.kind).toBe("demo");
      expect(unit.stages[0]?.notes).toEqual(song.notes);
      const practice = unit.stages.slice(1);
      expect(practice.length).toBeGreaterThanOrEqual(1);
      expect(practice.every((stage) => stage.kind === "melody")).toBe(true);
      expect(practice.flatMap((stage) => stage.notes)).toEqual(song.notes);
      expect(playableById(song.id).id).toBe(song.id);
    }
  });

  it("opens Hot Cross Buns and Mary first, then the rest of the Home Steps band", () => {
    const first = [...HOME_STEPS_FIRST_SONG_IDS];
    const home = LIBRARY_SONGS.filter((song) => song.band === "home-steps");
    expect(home.slice(0, 2).map((song) => song.id)).toEqual(first);
    for (const song of home.slice(2)) {
      expect(song.unlockAfterSongIds).toEqual(first);
      expect(songPacingLabel(song)).toBe("Finish Hot Cross Buns and Mary Had a Little Lamb to open this song.");
    }
    for (const id of first) {
      expect(songById(id)?.unlockAfterSongIds ?? []).toEqual([]);
    }
    for (const song of LIBRARY_SONGS.filter((item) => item.band !== "home-steps")) {
      expect(song.unlockAfterSongIds ?? []).toEqual([]);
    }
  });

  it("lengthens Spring, Brahms Lullaby, and Canon into sections on the same keys", () => {
    const homeSteps = new Set([60, 62, 64, 65, 67]);
    const longer = ["song-spring", "song-brahms-lullaby", "song-canon"] as const;
    for (const id of longer) {
      const song = songById(id);
      expect(song?.sections?.length).toBeGreaterThanOrEqual(2);
      expect(song?.notes.length).toBeGreaterThanOrEqual(24);
      expect(songToUnit(song!).stages.length).toBe((song?.sections?.length ?? 0) + 1);
    }
    for (const note of songById("song-spring")?.notes ?? []) {
      expect(homeSteps.has(note.midi as number)).toBe(true);
    }
    expect(songById("song-canon")?.rhythm).toBe(true);
    expect(songById("song-brahms-lullaby")?.rhythm).toBe(false);
    expect(songById("song-spring")?.rhythm).toBe(false);
  });

  it("returns a stable playable object so practice does not reset on each key", () => {
    expect(playableById("song-au-clair")).toBe(playableById("song-au-clair"));
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
