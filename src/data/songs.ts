import type { CourseUnit, LessonNote, LibrarySong, SongSection } from "../types";
import { C, D, E, F, G, note } from "./lesson1";

const A = note(9, "A", 5);
const B = note(11, "B", 4);
const C5 = note(12, "C", 5);

function hold(source: LessonNote, duration: LessonNote["duration"]): LessonNote {
  return { ...source, duration };
}

/** The two folk songs that open as soon as Home Steps is finished. */
export const HOME_STEPS_FIRST_SONG_IDS = ["song-hot-cross-buns", "song-mary-lamb"] as const;

function piece(sections: SongSection[]): { notes: LessonNote[]; sections: SongSection[] } {
  return { notes: sections.flatMap((section) => section.notes), sections };
}

/**
 * Original Home Keys simplified arrangements of public-domain / traditional
 * melodies. Encoded as LessonNote lists — not commercial sheet or app packs.
 */
export const LIBRARY_SONGS: LibrarySong[] = [
  {
    id: "song-hot-cross-buns",
    title: "Hot Cross Buns",
    composer: "Traditional",
    tradition: "English nursery rhyme",
    licenseNote:
      "Traditional English nursery melody — public domain. Home Keys simplified arrangement © original.",
    blurb: "Three neighbor notes: E, D, and C. A gentle first folk tune after Home Steps.",
    unlockAfterUnitId: "basics-five",
    band: "home-steps",
    bandLabel: "After Home Steps",
    keyboard: "treble",
    rhythm: false,
    notes: [E, D, C, E, D, C, C, C, C, C, D, D, D, D, E, D, hold(C, "half")],
  },
  {
    id: "song-mary-lamb",
    title: "Mary Had a Little Lamb",
    composer: "Traditional",
    tradition: "American nursery song (melody published 1830s)",
    licenseNote:
      "Traditional / 19th-century nursery melody — composition PD in the US. Home Keys simplified arrangement © original.",
    blurb: "A familiar walk on C D E and G. Wait for each matching key.",
    unlockAfterUnitId: "basics-five",
    band: "home-steps",
    bandLabel: "After Home Steps",
    keyboard: "treble",
    rhythm: false,
    notes: [E, D, C, D, E, E, E, D, D, D, E, G, G, E, D, C, D, E, E, E, D, D, E, D, hold(C, "half")],
  },
  {
    id: "song-au-clair",
    title: "Au Clair de la Lune",
    composer: "Traditional",
    tradition: "French folk song",
    licenseNote:
      "Traditional French folk melody — public domain. Instrumental teaching line only. Home Keys simplified arrangement © original.",
    blurb: "A quiet moonlight tune on C, D, and E. No words — just the melody.",
    unlockAfterUnitId: "basics-five",
    unlockAfterSongIds: [...HOME_STEPS_FIRST_SONG_IDS],
    band: "home-steps",
    bandLabel: "After Home Steps",
    keyboard: "treble",
    rhythm: false,
    notes: [C, C, C, D, hold(E, "half"), hold(D, "half"), C, E, D, hold(C, "half")],
  },
  {
    id: "song-ode-to-joy",
    title: "Ode to Joy",
    composer: "Ludwig van Beethoven",
    tradition: "Theme from Symphony No. 9 (1824)",
    licenseNote:
      "Beethoven d. 1827 — composition PD in the US. Home Keys simplified single-line arrangement © original.",
    blurb: "The famous hymn-like theme, slowed down on C D E F G.",
    unlockAfterUnitId: "basics-five",
    unlockAfterSongIds: [...HOME_STEPS_FIRST_SONG_IDS],
    band: "home-steps",
    bandLabel: "After Home Steps",
    keyboard: "treble",
    rhythm: false,
    notes: [
      E, E, F, G, G, F, E, D, C, C, D, E, E, D, hold(D, "half"),
      E, E, F, G, G, F, E, D, C, C, D, E, D, C, hold(C, "half"),
    ],
  },
  {
    id: "song-lightly-row",
    title: "Lightly Row",
    composer: "Traditional",
    tradition: "Folk teaching melody",
    licenseNote:
      "Traditional folk melody used in many primers — public domain. Home Keys simplified arrangement © original.",
    blurb: "A boat-like lilt on the first five notes. Soft and even.",
    unlockAfterUnitId: "basics-five",
    unlockAfterSongIds: [...HOME_STEPS_FIRST_SONG_IDS],
    band: "home-steps",
    bandLabel: "After Home Steps",
    keyboard: "treble",
    rhythm: false,
    notes: [E, E, E, hold(G, "half"), D, D, D, hold(F, "half"), E, D, C, D, E, E, hold(E, "half"), D, D, E, D, hold(C, "half")],
  },
  {
    id: "song-spring",
    title: "Spring (motif)",
    composer: "Antonio Vivaldi",
    tradition: "The Four Seasons, Spring (1725)",
    licenseNote:
      "Vivaldi d. 1741 — composition PD in the US. Home Keys simplified opening in two sections, C D E F G only © original. Not the full concerto.",
    blurb: "The bird call, then a higher answer. Still only C D E F G. Play one section at a time.",
    unlockAfterUnitId: "basics-five",
    unlockAfterSongIds: [...HOME_STEPS_FIRST_SONG_IDS],
    band: "home-steps",
    bandLabel: "After Home Steps",
    keyboard: "treble",
    rhythm: false,
    ...piece([
      {
        id: "birds",
        title: "Birds",
        blurb: "The famous opening call. Only C, D, E, F, and G.",
        notes: [E, E, E, G, F, E, D, D, D, F, E, D, hold(C, "half")],
      },
      {
        id: "answer",
        title: "Higher answer",
        blurb: "The same idea, starting up on G, then it comes back home.",
        notes: [
          G, G, G, E, F, G,
          F, F, F, D, E, F,
          E, E, E, G, F, E, D,
          D, E, F, E, D, hold(C, "half"),
        ],
      },
    ]),
  },
  {
    id: "song-twinkle",
    title: "Twinkle Twinkle",
    composer: "Traditional / W. A. Mozart (theme)",
    tradition: "French melody Ah! vous dirai-je, Maman; Mozart wrote PD variations on it",
    licenseNote:
      "Traditional French melody (18th c.) — PD. Mozart d. 1791. Home Keys simplified arrangement © original.",
    blurb: "The star song, using A as well as C D E F G. Short A section only.",
    unlockAfterUnitId: "neighbors-abc",
    band: "neighbor-notes",
    bandLabel: "After Neighbor Notes",
    keyboard: "treble",
    rhythm: false,
    notes: [C, C, G, G, A, A, hold(G, "half"), F, F, E, E, D, D, hold(C, "half")],
  },
  {
    id: "song-frere-jacques",
    title: "Frère Jacques",
    composer: "Traditional",
    tradition: "French round (Are You Sleeping)",
    licenseNote:
      "Traditional French round — public domain. Instrumental melody only. Home Keys simplified arrangement © original.",
    blurb: "A friendly round as a single line, stepping up to A.",
    unlockAfterUnitId: "neighbors-abc",
    band: "neighbor-notes",
    bandLabel: "After Neighbor Notes",
    keyboard: "treble",
    rhythm: false,
    notes: [C, D, E, C, C, D, E, C, E, F, hold(G, "half"), G, A, G, F, E, C, C, G, hold(C, "half")],
  },
  {
    id: "song-brahms-lullaby",
    title: "Brahms Lullaby",
    composer: "Johannes Brahms",
    tradition: "Wiegenlied, Op. 49 No. 4 (1868)",
    licenseNote:
      "Brahms d. 1897; published 1868 — composition PD in the US. Home Keys simplified two-part arrangement © original. Instrumental only.",
    blurb: "A slow bedtime line in two parts. The first rocks. The second steps down and comes home. Uses A.",
    unlockAfterUnitId: "neighbors-abc",
    band: "neighbor-notes",
    bandLabel: "After Neighbor Notes",
    keyboard: "treble",
    rhythm: false,
    ...piece([
      {
        id: "rocking",
        title: "Rocking",
        blurb: "The bedtime line. The longer notes are part of the song.",
        notes: [E, hold(G, "half"), G, F, hold(A, "half"), A, G, F, E, D, hold(C, "whole")],
      },
      {
        id: "answer",
        title: "Soft answer",
        blurb: "A second phrase that steps down and rocks home again.",
        notes: [
          G, G, F, E,
          D, E, F, G,
          E, hold(G, "half"), G, F,
          hold(A, "half"), A, G,
          F, E, D, hold(C, "whole"),
        ],
      },
    ]),
  },
  {
    id: "song-minuet-g",
    title: "Minuet in G",
    composer: "Christian Petzold (traditionally attributed to J. S. Bach)",
    tradition: "BWV Anh. 114; Notebook for Anna Magdalena Bach",
    licenseNote:
      "Petzold d. 1733; Bach d. 1750 — composition PD. Home Keys simplified excerpt (C4–C5) © original.",
    blurb: "The well-known minuet opening, kept inside the first-octave keys. A, B, and high C.",
    unlockAfterUnitId: "neighbors-abc",
    band: "neighbor-notes",
    bandLabel: "After Neighbor Notes",
    keyboard: "treble",
    rhythm: false,
    notes: [D, G, A, B, C5, B, A, G, A, B, A, hold(G, "half")],
  },
  {
    id: "song-eine-kleine",
    title: "Eine Kleine Nachtmusik",
    composer: "Wolfgang Amadeus Mozart",
    tradition: "Serenade No. 13, K. 525 (1787) — opening idea",
    licenseNote:
      "Mozart d. 1791 — composition PD in the US. Home Keys simplified snippet © original. Not the full movement.",
    blurb: "The cheerful leap from G down to D, then up to B. A tiny night-music hello.",
    unlockAfterUnitId: "neighbors-abc",
    band: "neighbor-notes",
    bandLabel: "After Neighbor Notes",
    keyboard: "treble",
    rhythm: false,
    notes: [G, D, G, D, G, D, G, B, G, D, hold(G, "half")],
  },
  {
    id: "song-canon",
    title: "Canon (simplified)",
    composer: "Johann Pachelbel",
    tradition: "Canon in D (c. 1680) — C-major teaching line",
    licenseNote:
      "Pachelbel d. 1706 — composition PD in the US. Home Keys simplified single line in C, in three short sections © original. Not the full canon.",
    blurb: "A calm line in three short sections. Hold the long notes, then let go. Finish Steady Beats first.",
    unlockAfterUnitId: "rhythm-beats",
    band: "steady-beats",
    bandLabel: "After Steady Beats",
    keyboard: "treble",
    rhythm: true,
    ...piece([
      {
        id: "long-notes",
        title: "Long notes",
        blurb: "Hold each note for its full length, then let go.",
        notes: [
          hold(C, "half"),
          hold(E, "half"),
          hold(G, "half"),
          hold(A, "half"),
          hold(G, "half"),
          hold(F, "half"),
          hold(E, "half"),
          hold(C, "whole"),
        ],
      },
      {
        id: "climb",
        title: "Little steps",
        blurb: "Shorter steps that climb toward high C, with a few longer notes.",
        notes: [
          E, G, A, G, F, E, D, C,
          E, G, A, B, hold(C5, "half"), G, E, hold(C, "half"),
        ],
      },
      {
        id: "home",
        title: "Coming home",
        blurb: "Step back down and finish on a long C.",
        notes: [
          A, G, F, E, D, E, F, G,
          E, D, C, D, hold(E, "half"), hold(C, "whole"),
        ],
      },
    ]),
  },
];

export function songById(id: string): LibrarySong | undefined {
  return LIBRARY_SONGS.find((song) => song.id === id);
}

export function isLibrarySongId(id: string): boolean {
  return id.startsWith("song-");
}

/** Parent-facing reason a later Home Steps song is still waiting. */
export function songPacingLabel(song: LibrarySong): string | null {
  const titles = (song.unlockAfterSongIds ?? [])
    .map((id) => songById(id)?.title)
    .filter((title): title is string => Boolean(title));
  if (titles.length === 0) return null;
  if (titles.length === 1) return `Finish ${titles[0]} to open this song.`;
  const last = titles[titles.length - 1];
  const lead = titles.slice(0, -1).join(", ");
  const list = titles.length === 2 ? `${titles[0]} and ${titles[1]}` : `${lead}, and ${last}`;
  return `Finish ${list} to open this song.`;
}

/** Wrap a library song as a demo, then wait-for-correct practice. Long pieces use one stage per section. */
export function songToUnit(song: LibrarySong): CourseUnit {
  const sectioned = (song.sections?.length ?? 0) > 1;
  const practice = song.sections?.length
    ? song.sections
    : [
        {
          id: "melody",
          title: "Play the song",
          blurb: "Play each matching key. Hints stay hidden until you ask — or after a short wait.",
          notes: song.notes,
        },
      ];
  return {
    id: song.id,
    courseId: "library",
    title: song.title,
    subtitle: song.composer,
    blurb: song.blurb,
    keyboard: song.keyboard,
    rhythm: song.rhythm,
    stages: [
      {
        id: "demo",
        kind: "demo",
        title: "Hear the song",
        blurb: sectioned
          ? `Listen to ${song.title}. Then play it one section at a time.`
          : `Listen to a short Home Keys arrangement of ${song.title}. Then play it one note at a time.`,
        notes: song.notes,
      },
      ...practice.map((section) => ({
        id: section.id,
        kind: "melody" as const,
        title: section.title,
        blurb: section.blurb,
        notes: section.notes,
      })),
    ],
  };
}
