# Home Keys

A tablet-first piano primer for kids. Home Keys is an original product. It is inspired by the *idea* of guided piano practice (listen, see the staff, play the matching key) and does **not** copy Simply Piano — or any other commercial app — assets, branding, songs, lesson scripts, UI chrome, or course content.

Kids follow a short **course path** — notes, neighbors, reading the staff, the bass clef, rhythm, a light two-hand hello, then one short moment with both hands at once. After those early stages they can open a **song library** of free-to-use classical and folk teaching pieces. Each stage waits for the matching key. Parents keep a PIN on settings, profile switching, progress resets, and early exit. There are no ads, purchases, social accounts, or store links.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (Vite defaults to `http://localhost:5173`). Use an iPad or any browser in landscape. Chrome/Edge have the most complete Web MIDI support.

Other scripts:

```bash
npm test
npm run build
npm run preview   # production build + service worker (offline check)
```

Data stays in this browser (`localStorage` key `home-keys-v1`). Reset it from Grown-up settings.

## First-run path

1. Grown-up creates a **4, 5, or 6 digit** PIN.
2. Grown-up adds a kid profile.
3. Kid starts **Home Steps** (the first five treble notes). Later stages stay locked until the prior one is finished. After Home Steps, **Hot Cross Buns** and **Mary Had a Little Lamb** open first. The other Home Steps songs wait until those two are finished. Unlocked songs do not need the PIN.
4. Settings, switching kid profiles, resetting progress, and leaving a lesson early all ask for the PIN (unless a parent just unlocked).

## Course path

Original Home Keys material only. No licensed songs, Disney/pop tunes, or lookalike branding.

| Order | Stage | What the kid learns | Tiny original melody |
| --- | --- | --- | --- |
| 1 | **Home Steps** | Treble **C D E F G**, wait-for-correct | **Garden Walk** — C D E D E F E D C |
| 2 | **Neighbor Notes** | A, B, and high C in C major position | **Porch Light** |
| 3 | **Read the Staff** | Middle C and the G on the second line, then steps and skips. White keys, C to C | **Skip Home** |
| 4 | **Bass Clef** | Left-hand F on the fourth line, then a few white keys around it. The right hand stays quiet | **Fourth Line** |
| 5 | **Steady Beats** | Quarter, half, whole, and rest. Hold the key for the full value, then let go | **Quiet Clock** |
| 6 | **Two Hands Hello** | Sequential left-hand C and G (open fifth), then a right-hand wave. One hand at a time | **Low Door** |
| 7 | **Both at Once** | Left hand holds low C while the right hand plays C E G E. Both hands sound together | **Still Steps** |

Each stage: a short tip / demo → guided practice (hints + wait) → the melody. The next stage unlocks only after the prior one is finished. A grown-up can **Unlock entire path** in settings (behind the PIN) for testing.

**Read the Staff** opens after Neighbor Notes. The demo names two landmarks: middle C on the ledger line under the staff, and G on the second line. In **Steps** and **Skip Home** the key does not glow and the letter is hidden. The child reads the notehead and plays that white key. **Show hint** reveals the letter, the finger number, and the key. Practice still waits for the right note. This lesson uses only the white keys from middle C to high C. Finger numbers are the same as the rest of the path. Steady Beats still requires a full hold when a note has a length.

**Bass Clef** opens after Read the Staff. The demo names left-hand F on the fourth line of the bass staff. The two dots of the bass clef sit around that line. In **Notes around F** and **Fourth Line** the letter stays hidden and no key glows until **Show hint**. Only the left hand plays: C, D, E, F, and G below middle C. A right-hand key is a miss and the lesson stays. The right hand does not play in this unit. This is not hands together.

**Both at Once** opens after Two Hands Hello. Two Hands Hello stays turn-taking: left, then right, never at the same time. Both at Once is the first time both hands play together. The left hand holds low C. The right hand plays C, E, G, E while that C stays down. Each staff is labeled, and the glowing keys say LH and RH. Practice waits until both keys are down. The right-hand note still has to be held for its beat, then released. Letting go early stays on that note. One hand alone does not count. Still Steps is an original pattern, white keys only.

**Steady Beats** is the rhythm lesson. A right pitch counts only after it is held for the whole note and then released. A quarter is one count, a half is two, and a whole is four (about 0.7 seconds per count). Letting go early stays on that note and shows the same coral “try again” as a wrong key. The lesson waits until the pitch is right and the hold is long enough. Rests are still one quiet count. There is no metronome.

To try it: finish Home Steps and Neighbor Notes, or unlock the path in grown-up settings, then start **Steady Beats** and tap **I am ready**. On **Hold and rest**, E is a half note and G is a whole note. Press and hold the glowing key. Release early and the lesson does not move on. Hold until it says to let go, then release, and it does.

Optional finger numbers: right-hand C=1 through G=5; left-hand notes show as LH. Toggle in settings.

The **course path** stays original Home Keys material. The separate **song library** (below) is the only place traditional / public-domain teaching melodies appear, as original simplified note lists.

## Song library

A kid-safe **Songs / Library** section on the home path. Unlocked songs play in the same practice mode as course stages (wait-for-correct, color feedback, mic / MIDI / on-screen keys, stars and XP). Playing an unlocked song does **not** ask for the parent PIN. Settings, early leave, and unlocking a *locked* song still do.

Songs unlock when the matching course stage is finished. After **Home Steps**, only **Hot Cross Buns** and **Mary Had a Little Lamb** open. Au Clair de la Lune, Ode to Joy, Lightly Row, and Spring stay locked until both of those are finished. Neighbor Notes songs and Canon still open with their own course stage. A grown-up can unlock one song (PIN on the library card) or **Unlock entire library** in settings, which skips the wait.

Spring, Brahms Lullaby, and Canon are longer than a single short line. Each is split into sections the child plays one at a time. Spring stays on C D E F G. Brahms Lullaby and Canon stay on the treble white keys. They are still public-domain melodies in an original Home Keys simplification, not a full concerto, lullaby edition, or canon.

These are original Home Keys simplified arrangements encoded as note sequences — not Simply Piano, MuseScore commercial packs, Disney/pop/video-game melodies, or copyrighted modern editions.

| Song | Source | Why it is free to use | Unlocks after |
| --- | --- | --- | --- |
| **Hot Cross Buns** | Traditional English nursery rhyme | Traditional melody, public domain; Home Keys simplified arrangement © original | Home Steps |
| **Mary Had a Little Lamb** | Traditional / 1830s nursery song | Composition PD in the US; Home Keys simplified arrangement © original | Home Steps |
| **Au Clair de la Lune** | Traditional French folk | Traditional melody, PD; instrumental teaching line only; Home Keys simplified arrangement © original | Home Steps, after Hot Cross Buns and Mary are finished |
| **Ode to Joy** | Beethoven, Symphony No. 9 (1824) | Beethoven d. 1827 — composition PD; Home Keys simplified single-line arrangement © original | Home Steps, after Hot Cross Buns and Mary are finished |
| **Lightly Row** | Traditional folk teaching melody | Traditional melody, PD; Home Keys simplified arrangement © original | Home Steps, after Hot Cross Buns and Mary are finished |
| **Spring (motif)** | Vivaldi, *The Four Seasons* (1725) | Vivaldi d. 1741 — composition PD; Home Keys opening in two sections, C–G only © original | Home Steps, after Hot Cross Buns and Mary are finished |
| **Twinkle Twinkle** | Traditional French *Ah! vous dirai-je, Maman* (Mozart wrote PD variations on the theme) | Traditional 18th-c. melody, PD; Mozart d. 1791; Home Keys simplified arrangement © original | Neighbor Notes |
| **Frère Jacques** | Traditional French round | Traditional melody, PD; instrumental only; Home Keys simplified arrangement © original | Neighbor Notes |
| **Brahms Lullaby** | Brahms, *Wiegenlied* Op. 49 No. 4 (1868) | Brahms d. 1897; published 1868 — composition PD in the US; Home Keys two-part arrangement © original | Neighbor Notes |
| **Minuet in G** | Christian Petzold (traditionally attributed as Bach BWV Anh. 114) | Petzold d. 1733; Bach d. 1750 — composition PD; Home Keys simplified C4–C5 excerpt © original | Neighbor Notes |
| **Eine Kleine Nachtmusik** | Mozart, K. 525 (1787) | Mozart d. 1791 — composition PD; Home Keys simplified snippet © original | Neighbor Notes |
| **Canon (simplified)** | Pachelbel, Canon in D (c. 1680) | Pachelbel d. 1706 — composition PD; longer C-major line in three sections © original | Steady Beats |

All twelve pieces stay on treble C4–C5 white keys so they match the on-screen keyboard. None include adult, drinking, war, romantic/adult-lyric, or spooky horror themes.

## Lesson 1 brief

| Stage | What happens |
| --- | --- |
| **Meet the notes** (demo) | Watch and hear C–G on the treble staff. No scoring. |
| **Find each key** (guided) | Play C, D, E, F, G. The target key glows. Practice **waits** until that note is heard. |
| **Garden Walk** (melody) | A short **original** tune using only those notes: C D E D E F E D C. Hints stay hidden until you tap **Show hint** or after about five seconds. |

Home Steps is the same Lesson 1 path as before. Garden Walk is original Home Keys material.

## Rewards (kid-safe)

Practice can earn looks. Nothing is sold, and practice is never blocked by energy, ads, or lootboxes.

- **1–3 stars** per stage: 3 if no wrong notes, 2 if wrongs stay at or under half the scored notes, otherwise 1. Replays keep the best star score.
- **XP / level** on the kid profile: 50 XP the first time a stage is finished, plus 10 XP per star. 100 XP per level. Replays only add XP when stars improve.
- **Streak** counts days practiced in a row. It is a quiet counter — no nagging.
- **Cosmetics only** at later levels: stickers, a theme color, or an avatar badge. Kids can equip unlocked looks on the home path. Warm Cream is always available.
- A short celebration plays when a stage is finished (and if the kid leveled up).
- Grown-ups see stars, XP, and streak in settings. **Kids cannot reset progress** without the PIN.

## Color feedback

| Color | Meaning |
| --- | --- |
| **Green** (`#2F8F5B`) | Correct — right note before a hint was shown. |
| **Gold** (`#D4A017`) | Correct after hint — right note after the target key was highlighted. |
| **Coral** (`#C44B3C`) | Wrong — any other note. The lesson does **not** advance. |

Guided stage shows the hint immediately, so those successes are gold. Garden Walk can still score green if the kid plays the note before a hint appears.

## Mic vs MIDI vs on-screen keys

Home Keys listens on three paths at once during practice. The lesson chrome shows a **Mic** pill and a **MIDI** pill:

| Pill state | Meaning |
| --- | --- |
| Off | Listening is not running (demo stage, or lesson not started). |
| Starting… | Permission / device setup in progress. |
| Calibrating… | Grown-up settings → Listen for middle C. |
| Listening | Ready. MIDI also names the plugged-in keyboard when it can. |
| Heard C4 (etc.) | A note was just detected on that path. |
| Error | Mic permission blocked, or Web MIDI missing / failed. Practice shows **Allow microphone** so the kid (or grown-up) can retry the browser prompt. MIDI and on-screen keys still work. |

| Input | How it works | Limits |
| --- | --- | --- |
| **Web MIDI** | `navigator.requestMIDIAccess` — note-on events map 1:1 to piano keys. Best accuracy. | Safari on iPad / iOS generally has **no Web MIDI**. Use Chrome on a computer or Android, or a browser that implements the API. The page must be `localhost` or HTTPS. |
| **Microphone** | [Pitchy](https://github.com/ianprime0509/pitchy) (YIN) on the Web Audio API. Play a real acoustic or digital piano into the mic. Calibrate with **Listen for middle C** so a slightly sharp/flat room piano still maps to C4. | Rooms are noisy. Soft notes, pedals, and overlapping tones confuse pitch detection. Headphones can leak. iOS will prompt for mic permission. This MVP prefers a clear, single note held for a moment over studio-grade DSP. |
| **On-screen keyboard** | Large C4–C5 keys, with the target key highlighted. Useful on a tablet while you set up, and for automated tests. | This is a fallback, not a replacement for a real keyboard. |

Calibration stores an offset in **cents** from concert pitch (A4 = 440 Hz, middle C ≈ 261.63 Hz). MIDI does not use that offset.

## Parental PIN

The PIN never leaves this device.

- Stored as a **random salt + PBKDF2-SHA-256** (100,000 iterations). Older unsalted hashes are still checked once, then upgraded on the next correct unlock.
- After **5** wrong tries the pad **locks** (30s, then 1, 2, then 4 minutes). Failed attempts are saved, so refreshing the page does not reset the pause.
- A correct PIN opens a **two-minute parent window**. Settings, profile switching, and Leave skip the pad during that window so a grown-up is not asked again and again. Kids cannot spam guesses while the pad is locked.
- Switching kid profiles always requires that window or a fresh PIN.

This is still a local 4–6 digit gate, not a password manager. It is meant to slow a child down, not to resist a determined adult with device access.

## Session time

The optional limit (default 15 minutes) runs **whenever a kid profile is active** — on the home screen and in any lesson, not only after Start. Starting a lesson does not reset the clock. When time is up, practice pauses until a PIN adds time or sends the kid home.

## Offline / PWA

`npm run build` emits a service worker that precaches the app shell, course code, icons, and **bundled** Nunito / Fraunces files (no Google Fonts network request). After one online visit, the path can be opened offline from the home screen.

Install: Chrome / Edge / Android “Install app”, or iPad Share → Add to Home Screen. Use `npm run preview` to try the production worker locally.

## Stack

Vite + React + TypeScript. Pitch detection via `pitchy`. Persistence via `localStorage`. Designed for iPad landscape (safe-area padding, large tap targets, staff above a wide keyboard).
