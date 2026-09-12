# Home Keys

A tablet-first piano primer for kids. Home Keys is an original product. It is inspired by the *idea* of guided piano practice (listen, see the staff, play the matching key) and does **not** copy Simply Piano — or any other commercial app — assets, branding, songs, lesson scripts, UI chrome, or course content.

The first lesson teaches the first five treble notes around middle C: **C D E F G**. Practice mode waits on the target note. Parents keep a PIN on settings, profile switching, and early exit. There are no ads, purchases, social accounts, or store links.

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

1. Grown-up creates a 4-digit PIN.
2. Grown-up adds a kid profile.
3. Kid starts **Lesson 1 · First five notes**.
4. Settings, switching kid profiles, and leaving a lesson early all ask for the PIN (unless a parent just unlocked).

## Lesson 1 brief

| Stage | What happens |
| --- | --- |
| **Meet the notes** (demo) | Watch and hear C–G on the treble staff. No scoring. |
| **Find each key** (guided) | Play C, D, E, F, G. The target key glows. Practice **waits** until that note is heard. |
| **Garden Walk** (melody) | A short **original** tune using only those notes: C D E D E F E D C. Hints stay hidden until you tap **Show hint** or after about five seconds. |

Optional right-hand finger numbers: C=1, D=2, E=3, F=4, G=5 (toggle in settings).

Garden Walk is original Home Keys material. Do not add copyrighted songs.

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
| Error | Mic permission blocked, or Web MIDI missing / failed. |

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

This is still a local 4-digit gate, not a password manager. It is meant to slow a child down, not to resist a determined adult with device access.

## Session time

The optional limit (default 15 minutes) runs **whenever a kid profile is active** — on the home screen and in Lesson 1, not only after Start Lesson 1. Starting a lesson does not reset the clock. When time is up, practice pauses until a PIN adds time or sends the kid home.

## Offline / PWA

`npm run build` emits a service worker that precaches the app shell, Lesson 1 code, icons, and **bundled** Nunito / Fraunces files (no Google Fonts network request). After one online visit, Lesson 1 can be opened offline from the home screen.

Install: Chrome / Edge / Android “Install app”, or iPad Share → Add to Home Screen. Use `npm run preview` to try the production worker locally.

## Stack

Vite + React + TypeScript. Pitch detection via `pitchy`. Persistence via `localStorage`. Designed for iPad landscape (safe-area padding, large tap targets, staff above a wide keyboard).
