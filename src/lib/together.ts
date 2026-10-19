import { requiredHoldMs } from "./rhythm";

export interface TogetherSession {
  bassMidi: number | null;
  bassDownSince: number | null;
  melodyMidi: number | null;
  melodyDownSince: number | null;
  kind: "correct" | "correct-after-hint" | null;
}

export type TogetherPhase = "need-bass" | "bass-ready" | "holding" | "ready";

export type TogetherEvent =
  | { type: "ignore" }
  | { type: "wrong" }
  | { type: "need-bass" }
  | { type: "bass-ready" }
  | { type: "holding"; kind: "correct" | "correct-after-hint" }
  | { type: "early-release" }
  | { type: "completed"; kind: "correct" | "correct-after-hint"; bassStillDown: boolean };

export function emptyTogether(): TogetherSession {
  return {
    bassMidi: null,
    bassDownSince: null,
    melodyMidi: null,
    melodyDownSince: null,
    kind: null,
  };
}

function scoredKind(hintVisible: boolean): "correct" | "correct-after-hint" {
  return hintVisible ? "correct-after-hint" : "correct";
}

/**
 * Both hands have to be down together.
 * A melody note alone does not count. A bass note alone does not count.
 * When the beat has a length, the hold starts only once both keys are down.
 */
export function togetherAttack(
  session: TogetherSession,
  playedMidi: number,
  melodyMidi: number,
  bassMidi: number,
  hintVisible: boolean,
  now: number,
  needsHold: boolean,
): { session: TogetherSession; event: TogetherEvent } {
  if (playedMidi !== melodyMidi && playedMidi !== bassMidi) {
    return { session, event: { type: "wrong" } };
  }

  if (playedMidi === bassMidi) {
    if (session.bassDownSince != null && session.bassMidi === bassMidi) {
      return { session, event: { type: "ignore" } };
    }
    const next: TogetherSession = { ...session, bassMidi, bassDownSince: now };
    if (next.melodyDownSince != null && next.melodyMidi === melodyMidi) {
      if (!needsHold) {
        const kind = scoredKind(hintVisible);
        return {
          session: { ...next, melodyMidi: null, melodyDownSince: null, kind: null },
          event: { type: "completed", kind, bassStillDown: true },
        };
      }
      const kind = scoredKind(hintVisible);
      next.melodyDownSince = now;
      next.kind = kind;
      return { session: next, event: { type: "holding", kind } };
    }
    return { session: next, event: { type: "bass-ready" } };
  }

  if (session.bassDownSince == null || session.bassMidi !== bassMidi) {
    return {
      session: { ...session, melodyMidi, melodyDownSince: now, kind: null },
      event: { type: "need-bass" },
    };
  }
  if (session.melodyDownSince != null && session.melodyMidi === melodyMidi) {
    return { session, event: { type: "ignore" } };
  }
  if (!needsHold) {
    const kind = scoredKind(hintVisible);
    return {
      session: { ...session, melodyMidi: null, melodyDownSince: null, kind: null },
      event: { type: "completed", kind, bassStillDown: true },
    };
  }
  const kind = scoredKind(hintVisible);
  return {
    session: { ...session, melodyMidi, melodyDownSince: now, kind },
    event: { type: "holding", kind },
  };
}

/**
 * Letting go of either hand before the beat is finished is a miss.
 * Letting go of the right hand after the full value counts, and the left hand may stay down.
 */
export function togetherRelease(
  session: TogetherSession,
  releasedMidi: number,
  melodyMidi: number,
  bassMidi: number,
  melodyDuration: string | undefined,
  now: number,
  beatMs?: number,
): { session: TogetherSession; event: TogetherEvent } {
  const melodyHeld = session.melodyDownSince != null && session.melodyMidi === melodyMidi;
  const bassHeld = session.bassDownSince != null && session.bassMidi === bassMidi;
  const bothDown = melodyHeld && bassHeld;
  const required = requiredHoldMs(melodyDuration, beatMs);
  const longEnough = bothDown && session.melodyDownSince != null && now - session.melodyDownSince >= required;

  if (releasedMidi === melodyMidi && melodyHeld) {
    if (longEnough && session.kind) {
      return {
        session: { ...session, melodyMidi: null, melodyDownSince: null, kind: null },
        event: { type: "completed", kind: session.kind, bassStillDown: true },
      };
    }
    if (bothDown) {
      return {
        session: { ...session, melodyMidi: null, melodyDownSince: null, kind: null },
        event: { type: "early-release" },
      };
    }
    return {
      session: { ...session, melodyMidi: null, melodyDownSince: null, kind: null },
      event: { type: "ignore" },
    };
  }

  if (releasedMidi === bassMidi && bassHeld) {
    if (bothDown && !longEnough) {
      return { session: emptyTogether(), event: { type: "early-release" } };
    }
    if (longEnough && session.kind) {
      return { session: emptyTogether(), event: { type: "completed", kind: session.kind, bassStillDown: false } };
    }
    return {
      session: {
        ...emptyTogether(),
        melodyMidi: session.melodyMidi,
        melodyDownSince: session.melodyDownSince,
      },
      event: { type: "need-bass" },
    };
  }

  return { session, event: { type: "ignore" } };
}

/** The left-hand key can stay down into the next right-hand note when it is the same pitch. */
export function carryTogetherBass(session: TogetherSession, nextBassMidi: number | null): TogetherSession {
  if (nextBassMidi == null || session.bassDownSince == null || session.bassMidi !== nextBassMidi) {
    return emptyTogether();
  }
  return {
    bassMidi: session.bassMidi,
    bassDownSince: session.bassDownSince,
    melodyMidi: null,
    melodyDownSince: null,
    kind: null,
  };
}
