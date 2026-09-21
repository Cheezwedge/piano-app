import { useMemo, useState } from "react";
import { PinPad } from "../components/PinPad";
import { LIBRARY_SONGS } from "../data/songs";
import { isSongUnlocked } from "../lib/progress";
import { useActiveKid, useApp } from "../store/AppState";
import type { LibrarySong, SongBand } from "../types";

type SongFilter = "all" | "unlocked" | SongBand;

const FILTERS: { id: SongFilter; label: string }[] = [
  { id: "all", label: "All songs" },
  { id: "unlocked", label: "Unlocked" },
  { id: "home-steps", label: "Home Steps" },
  { id: "neighbor-notes", label: "Neighbor Notes" },
  { id: "steady-beats", label: "Steady Beats" },
];

export function LibraryScreen() {
  const { persist, setScreen, setActiveUnitId, checkPin, isParentUnlocked, unlockSong } = useApp();
  const kid = useActiveKid();
  const [filter, setFilter] = useState<SongFilter>("all");
  const [unlockTarget, setUnlockTarget] = useState<string | null>(null);
  const stars = kid?.stageStars ?? {};

  const options = {
    stars,
    pathUnlocked: persist.pathUnlocked,
    libraryUnlocked: persist.libraryUnlocked,
    parentUnlockedSongs: kid?.unlockedSongs ?? [],
  };

  const rows = useMemo(() => {
    return LIBRARY_SONGS.map((song) => ({
      song,
      open: isSongUnlocked(song.unlockAfterUnitId, song.id, options),
    })).filter(({ song, open }) => {
      if (filter === "all") return true;
      if (filter === "unlocked") return open;
      return song.band === filter;
    });
    // options fields are primitives / arrays from persist
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, persist.pathUnlocked, persist.libraryUnlocked, kid?.unlockedSongs, kid?.stageStars]);

  const startSong = (song: LibrarySong) => {
    setActiveUnitId(song.id);
    setScreen("lesson");
  };

  const requestUnlock = (songId: string) => {
    if (isParentUnlocked()) {
      unlockSong(songId);
      return;
    }
    setUnlockTarget(songId);
  };

  return (
    <main className="page library" data-testid="library-screen">
      <header className="topbar">
        <div>
          <p className="eyebrow">Free to use</p>
          <h1>Song library</h1>
        </div>
        <button type="button" className="btn ghost" data-testid="library-back" onClick={() => setScreen("home")}>
          Back home
        </button>
      </header>

      <section className="library-intro">
        <p>
          Gentle classical and folk teaching pieces. Each one is a public-domain or traditional melody with an
          original Home Keys arrangement. No Disney, pop, or video-game tunes.
        </p>
        <p className="muted">
          Songs open when you finish the matching course stage. Unlocked songs do not need a grown-up PIN. A
          grown-up can unlock a locked song early.
        </p>
      </section>

      <div className="choice-row" data-testid="library-filters" role="tablist" aria-label="Filter songs">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={filter === item.id ? "chip selected" : "chip"}
            data-testid={`filter-${item.id}`}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ol className="song-list">
        {rows.map(({ song, open }) => {
          const earned = stars[song.id] ?? 0;
          return (
            <li
              key={song.id}
              className={open ? "song-card open" : "song-card locked"}
              data-testid={`song-${song.id}`}
              data-unlocked={open ? "true" : "false"}
            >
              <div className="song-copy">
                <p className="eyebrow">{song.bandLabel}</p>
                <h2>{song.title}</h2>
                <p className="song-composer">{song.composer}</p>
                <p>{song.blurb}</p>
                <p className="muted song-license">{song.licenseNote}</p>
                <p className="star-row tiny" aria-label={earned ? `${earned} stars` : "Not finished"}>
                  {[1, 2, 3].map((slot) => (
                    <span key={slot} className={slot <= earned ? "lit" : ""}>
                      ★
                    </span>
                  ))}
                </p>
              </div>
              <div className="song-actions">
                {open ? (
                  <button
                    type="button"
                    className="btn primary"
                    disabled={!kid}
                    data-testid={`play-${song.id}`}
                    onClick={() => startSong(song)}
                  >
                    {earned ? "Play again" : "Play"}
                  </button>
                ) : (
                  <>
                    <button type="button" className="btn ghost" disabled data-testid={`locked-${song.id}`}>
                      Locked
                    </button>
                    <button
                      type="button"
                      className="btn tiny"
                      disabled={!kid}
                      data-testid={`parent-unlock-${song.id}`}
                      onClick={() => requestUnlock(song.id)}
                    >
                      Grown-up unlock
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {rows.length === 0 ? (
        <p className="muted" data-testid="library-empty">
          No songs in this filter yet. Finish a course stage, or choose All songs.
        </p>
      ) : null}

      <section className="library-legal">
        <h2>Why these songs are here</h2>
        <p>
          Home Keys only includes compositions that are public domain in the US, or traditional / folk melodies
          that are clearly free to use. The note lists in this app are original simplified arrangements — not
          copies of Simply Piano, MuseScore packs, or modern copyrighted editions.
        </p>
      </section>

      {unlockTarget ? (
        <PinPad
          title="Unlock this song?"
          subtitle="A grown-up PIN can open a locked song early. Playing it still does not need the PIN."
          submitLabel="Unlock"
          onCancel={() => setUnlockTarget(null)}
          onSubmit={async (pin) => {
            const result = await checkPin(pin);
            if (result.ok) {
              unlockSong(unlockTarget);
              setUnlockTarget(null);
            }
            return result;
          }}
        />
      ) : null}
    </main>
  );
}
