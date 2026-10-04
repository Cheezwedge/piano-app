import { describe, expect, it } from "vitest";
import { COURSE_UNITS } from "../data/courses";
import { RHYTHM_BEAT_MS } from "./rhythm";
import { carryTogetherBass, emptyTogether, togetherAttack, togetherRelease, type TogetherSession } from "./together";

const BASS = 48;
const C = 60;
const E = 64;
const BEAT = RHYTHM_BEAT_MS;

function attack(
  session: TogetherSession,
  midi: number,
  melody: number,
  now: number,
  needsHold = true,
) {
  return togetherAttack(session, midi, melody, BASS, false, now, needsHold);
}

describe("hands together", () => {
  it("does not count the right hand alone or the left hand alone", () => {
    const melodyOnly = attack(emptyTogether(), C, C, 0);
    expect(melodyOnly.event.type).toBe("need-bass");
    const released = togetherRelease(melodyOnly.session, C, C, BASS, "quarter", 50, BEAT);
    expect(released.event.type).toBe("ignore");

    const bassOnly = attack(emptyTogether(), BASS, C, 0);
    expect(bassOnly.event.type).toBe("bass-ready");
    const bassUp = togetherRelease(bassOnly.session, BASS, C, BASS, "quarter", 800, BEAT);
    expect(bassUp.event.type).toBe("need-bass");
  });

  it("does not count a wrong pitch", () => {
    let session = attack(emptyTogether(), BASS, C, 0).session;
    const wrong = attack(session, 62, C, 20);
    expect(wrong.event.type).toBe("wrong");
    expect(wrong.session.bassDownSince).toBe(0);
    session = wrong.session;
    const early = togetherRelease(session, C, C, BASS, "quarter", 20, BEAT);
    expect(early.event.type).not.toBe("completed");
  });

  it("fails an early release and passes a full hold while the bass stays down", () => {
    let session = attack(emptyTogether(), BASS, C, 0).session;
    session = attack(session, C, C, 10).session;

    const early = togetherRelease(session, C, C, BASS, "quarter", 10 + BEAT - 1, BEAT);
    expect(early.event.type).toBe("early-release");
    expect(early.session.bassDownSince).toBe(0);
    expect(early.session.melodyDownSince).toBeNull();

    session = attack(early.session, C, C, 20).session;
    const held = togetherRelease(session, C, C, BASS, "quarter", 20 + BEAT, BEAT);
    expect(held.event).toEqual({ type: "completed", kind: "correct", bassStillDown: true });
    expect(held.session.bassDownSince).toBe(0);
  });

  it("fails if the left hand lets go during the beat", () => {
    let session = attack(emptyTogether(), BASS, C, 0).session;
    session = attack(session, C, C, 10).session;
    const dropped = togetherRelease(session, BASS, C, BASS, "quarter", 10 + 200, BEAT);
    expect(dropped.event.type).toBe("early-release");
    expect(dropped.session.bassDownSince).toBeNull();
    const next = attack(dropped.session, E, E, 400);
    expect(next.event.type).toBe("need-bass");
  });

  it("lets the same left-hand key stay down under the next right-hand note", () => {
    let session = attack(emptyTogether(), BASS, C, 0).session;
    session = attack(session, C, C, 10).session;
    session = togetherRelease(session, C, C, BASS, "quarter", 10 + BEAT, BEAT).session;
    session = carryTogetherBass(session, BASS);
    const next = attack(session, E, E, 10 + BEAT + 30);
    expect(next.event.type).toBe("holding");
    const done = togetherRelease(next.session, E, E, BASS, "quarter", 10 + BEAT + 30 + BEAT + 5, BEAT);
    expect(done.event.type).toBe("completed");
  });

  it("asks for the left hand again after it is released between notes", () => {
    let session = attack(emptyTogether(), BASS, C, 0).session;
    session = attack(session, C, C, 10).session;
    const done = togetherRelease(session, C, C, BASS, "quarter", 10 + BEAT, BEAT);
    session = togetherRelease(done.session, BASS, E, BASS, "quarter", 10 + BEAT + 20, BEAT).session;
    session = carryTogetherBass(session, BASS);
    expect(session.bassDownSince).toBeNull();
    expect(attack(session, E, E, 900).event.type).toBe("need-bass");
  });
});

describe("both-at-once course step", () => {
  const unit = COURSE_UNITS.find((item) => item.id === "hands-together");
  const hello = COURSE_UNITS.find((item) => item.id === "twohands-hello");

  it("adds one short together piece and leaves Two Hands Hello turn-taking", () => {
    expect(COURSE_UNITS.map((item) => item.id).at(-2)).toBe("hands-together");
    expect(unit?.rhythm).toBe(true);
    expect(unit?.keyboard).toBe("wide");
    expect(unit?.stages.map((stage) => stage.kind)).toEqual(["demo", "guided", "melody"]);

    for (const stage of unit?.stages ?? []) {
      expect(stage.notes.length).toBeGreaterThanOrEqual(3);
      expect(stage.notes.length).toBeLessThanOrEqual(4);
      const melody = stage.notes.map((note) => note.midi);
      expect(melody).toEqual([60, 64, 67, 64]);
      for (const note of stage.notes) {
        expect(note.hand ?? "right").toBe("right");
        expect(note.duration).toBe("quarter");
        expect(note.together?.hand).toBe("left");
        expect(note.together?.midi).toBe(48);
        expect(note.together?.duration).toBe("whole");
        expect([48, 60, 64, 67]).toContain(note.midi);
      }
    }

    const helloNotes = hello?.stages.flatMap((stage) => stage.notes) ?? [];
    expect(helloNotes.every((note) => note.together == null)).toBe(true);
    expect(hello?.stages[2].notes.map((note) => note.midi)).toEqual([48, 55, 60, 64, 67, 64, 60, 48]);
  });
});
