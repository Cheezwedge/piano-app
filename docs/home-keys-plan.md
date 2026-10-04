# Home Keys product plan

For R and the CEO. A parent who does not write code, and a coordinator running the work, should both be able to use this as-is.

Checked against public files on `main` (3 Oct 2026): `README.md`, `package.json`, `src/data/courses.ts`, `src/data/songs.ts`, plus the lesson, home, library, setup, and settings screens those files point at. Nothing below is a guessed feature. Where a real iPad has not been signed off, the plan says so.

## 1. Purpose

This plan says who Home Keys is for, what is already built, and what to build next. It is a working plan. It is not a pitch, not a ship date, and not a legal opinion.

Home Keys is a tablet-first piano primer for children. The child practices a short original course, then a small library of simplified public-domain and traditional tunes. A parent holds a PIN. Practice stays on this device.

This plan is not:

- A plan to copy Simply Piano, or any other commercial piano app: not their songs, characters, lesson scripts, screens, or course.
- Permission to add pop, Disney, film, or game music.
- A store, a subscription, a loot box, or an ad product.
- A publishing plan. Nothing here is a go-ahead to post, submit to an app store, or announce the product.

## 2. How kids actually learn piano

A typical first-year method book, whatever the brand, walks in about this order. Home Keys should follow the same order. The list below is the shared idea. It is not one publisher’s song list or page numbers.

1. **Posture and sound.** The child sits so the elbows are about level with the keys, feet on the floor or a stool. Fingers are curved. They play one key and listen. They find middle C by the pair of black keys just to its left. This step is “make a sound and know where you are,” before a lot of reading.

2. **White keys in one hand position.** The usual start is five notes under five fingers. Often the right-hand thumb sits on C, and the notes are C–D–E–F–G. The child learns the key names and plays them one at a time. Next-door notes (steps) come before skips.

3. **A few treble landmarks, not the whole staff at once.** The staff has five lines. The treble clef marks the upper staff. Children learn a landmark — middle C, or the G that sits on the second line — and then read by step and by skip from that landmark. Finger numbers (1 is the thumb, 5 is the pinky) tell which finger to use so the eyes can stay on the staff.

4. **Rhythm values and rests, against a steady pulse.** In the 4-count primers use, a quarter note is one beat, a half note is two, a whole note is four. A rest is the same length of silence. The hard part is not the symbol. It is keeping the beat while the key stays down, and not playing during a rest. Counting out loud, or a quiet pulse, comes before fancy rhythm.

5. **Left hand and the bass clef.** The left hand gets its own landmark, often low C or the F on the bass-clef fourth line. Early left-hand parts are a few notes, not a full bass line. Many books teach each hand alone before they share a piece.

6. **Hands together, still very easy.** The first “together” is not a dense duet. Hands take turns. Or one hand holds a long note while the other plays. Or both hands play the same simple rhythm. Taking turns is the step before true together. True together means both hands are supposed to sound at the same time on purpose.

7. **Dynamics and articulation.** Loud and soft, then gradually louder or softer. Legato means connected. Staccato means short and detached. These are how the music speaks. They come after the notes and the beat are reliable.

8. **Later, not in the first months.** Five-finger patterns, intervals (seconds, thirds, fifths), simple chords, and longer real pieces learned in sections. A piece should be one the child can finish. A four-note souvenir of a famous work is not repertoire.

Home Keys today covers a thin slice of steps 2 and 3, a light pass at step 4, and a turn-taking taste of steps 5 and 6. Posture, bass-clef reading, true hands-together, dynamics, and real-length pieces are still ahead. That is the right gap. Do not jump to chords or a big catalog while rhythm and reading are still thin.

## 3. What strong piano apps do well, and what we will not copy

Apps that children actually practice with tend to share a few habits. We can share the habits. We do not share their content.

They do well when they:

- Tell the child immediately whether the note was the one on the staff.
- Wait. A wrong note does not skip ahead. The piece stays until the matching key.
- Keep a session short enough for a young attention span.
- Show progress the child can see: a path, stars, “you finished this.”
- Give a small reward for practice. The reward is earned by playing, not by paying.

We will not copy:

- Their songs, arrangements, characters, or lesson words.
- Their screens, icons, or layout. Same kind of practice is fine. A lookalike is not.
- A paywall, an energy bar, a subscription, or a loot box.
- A social feed, chat, or ads.
- Pop, Disney, film, or game music, including “just the melody.”

Home Keys may use the same kind of loop a teacher uses beside a child: hear it, see it, play the matching key, wait. The notes, the words, and the look stay ours.

## 4. Product principles

- **Kid-safe.** No ads, no social network, no store, no child accounts, no scary or romantic content. Library pieces are instrumental. Blurbs do not teach adult lyrics.
- **Original, or public-domain only.** Course tunes are original (Garden Walk, Porch Light, Quiet Clock, Low Door). The library is traditional or public-domain music in our own short arrangements, on white keys from C4 to C5. The notes inside the repo that say why a tune is free to use are our checklist. They are not a lawyer’s opinion. If a piece is doubtful, it stays out.
- **Parent in control.** The PIN gates settings, profile switching, progress reset, leaving a lesson early, and unlocking something that is still locked. An unlocked song does not ask for the PIN.
- **Short sessions.** The timer runs whenever a kid profile is active, on the home screen and in a lesson. The default is 15 minutes. Choices in settings today are no limit, 10, 15, 20, or 30. When time is up, practice pauses until a PIN adds time or sends the child home.
- **Honest feedback.** Green means the right note before a hint. Gold means the right note after a hint. Coral means a wrong note, and the lesson does not move on. We do not cheer a miss. Guided steps show the hint immediately, so those successes are gold. Melody steps can still be green if the child plays before the hint.
- **Offline-friendly tablet.** The production build precaches the app shell, course, icons, and bundled fonts. iPad Safari is the main screen for the mic and the on-screen keys. Web MIDI is for a desktop browser that actually has it (Chrome or Edge). iPad Safari does not.

## 5. Where we are now

Home Keys on `main` is a web app (Vite, React, TypeScript) aimed at a tablet in landscape. It can be installed as a home-screen app. Data stays in this browser under the `localStorage` key `home-keys-v1`. There is no account and no server.

**What a child can do today**

- First visit: the grown-up sets a 4-, 5-, or 6-digit PIN, then a kid profile (first name and one of eight animal avatars).
- Practice listens three ways at once: microphone (Pitchy), MIDI note-on, and on-screen keys (C4–C5, wider when the left hand appears). A Mic pill and a MIDI pill show off, starting, listening, the note just heard, or an error. If the mic is blocked, **Allow microphone** retries the browser prompt. MIDI and the on-screen keys still work.
- Wait-for-correct. A wrong pitch does not advance. The banner says “Try again.” The right pitch does.
- Color feedback as in the principle above, plus a color legend on the home screen and in settings.
- Optional finger numbers, on by default: right hand C=1 through G=5; left-hand notes show as LH. Toggle: **Show finger numbers** in grown-up settings.
- Stars gate the next course unit. 1–3 stars: 3 if there were no wrong notes, 2 if wrongs stay at or under half the scored notes, otherwise 1. Replays keep the best star score. A grown-up can **Unlock entire path** behind the PIN. That control is for testing, not for the child.
- Rewards: stars, XP, levels, a practice streak, and cosmetic stickers, themes, and badges. First finish of a unit is 50 XP plus 10 XP per star. 100 XP per level. Replays add XP only when the star score improves. Warm Cream is always available. Nothing is for sale. The home screen says practice is never paused for energy.
- Parental PIN: random salt and PBKDF2-SHA-256 (100,000 iterations). After 5 wrong tries the pad locks (30 seconds, then 1, 2, then 4 minutes). A correct PIN opens a two-minute parent window so settings and profile switches are not asked again and again. This slows a child down. It is not protection against an adult who has the device.
- Session limit, as in the principles. The time-up screen says “Practice time is done,” with **Go home** or **Add more time**, both behind the PIN.

**Course path (four original units)**

Each unit is a short demo, then guided practice, then an original melody. The next unit stays locked until the one before it has stars, unless a grown-up unlocks the path.

| Order | Unit | What it teaches | Melody |
| --- | --- | --- | --- |
| 1 | Home Steps | Treble C D E F G | Garden Walk (C D E D E F E D C) |
| 2 | Neighbor Notes | A, B, and high C | Porch Light |
| 3 | Steady Beats | Quarter, half, whole, and rest, in the lesson text and the note list | Quiet Clock |
| 4 | Two Hands Hello | Left-hand low C then low G, then a right-hand answer. Hands take turns. | Low Door |

**Song library (twelve pieces, merged as PR #2, commit `1f283c3`)**

Same practice mode as the course: wait-for-correct, colors, mic / MIDI / on-screen keys, stars and XP. Playing an unlocked song does not ask for the PIN. A locked song shows **Locked** and **Grown-up unlock** (PIN). Settings can **Unlock entire library**.

All twelve are simplified original note lists on treble C4–C5 white keys. The repo states why each source is free to use. That statement is ours, not a clearance letter.

| Unlocks after | Songs |
| --- | --- |
| Home Steps | Hot Cross Buns, Mary Had a Little Lamb, Au Clair de la Lune, Ode to Joy, Lightly Row, Spring (motif) |
| Neighbor Notes | Twinkle Twinkle (A section only), Frère Jacques, Brahms Lullaby, Minuet in G, Eine Kleine Nachtmusik |
| Steady Beats | Canon (simplified), and this one is marked as a rhythm piece |
| Two Hands Hello | No song is gated on this unit |

**Known soft spots (do not describe these as finished)**

- Six songs unlock at once when Home Steps is finished. That is a lot of new pieces before Neighbor Notes.
- A few motifs are very short. Spring is 13 notes and is labeled a motif. Brahms Lullaby is 11 notes. Canon is 8 notes, all holds. Eine Kleine Nachtmusik is an 11-note snippet. Twinkle is the A section only, and the blurb says so. A parent who knows the real piece may not recognize the shortest ones.
- Rhythm scoring is lighter than a full hold-and-rest engine. Steady Beats does put quarter, half, whole, and rest on the notes. After the right pitch, the lesson waits about seven-tenths of a second per beat and then moves on. A half or whole shows “Hold the beat,” but letting go early still counts once that timer ends. A rest does wait in silence, and a sound during the rest counts wrong and restarts the wait. There is no pulse the child plays with. Pitch is judged. Duration of the finger is not.
- The service worker exists (`vite-plugin-pwa`). `npm run build` then `npm run preview` is how to try it. Live device QA is not signed off: iPad offline, a real piano into the mic, and USB MIDI on a desktop.
- iPad Safari: mic and on-screen keys are the supported path. Web MIDI on iPad Safari is expected to fail. That fail is correct, not a bug to “fix” inside Safari.
- Rooms are noisy. Soft notes, the pedal, and two notes at once confuse the mic. The app is built for one clear note. Middle C can be calibrated in grown-up settings (**Calibrate microphone**). MIDI does not use that offset.

## 6. Feature roadmap in phases

Each phase has a goal, the work, why it matches the learning order in section 2, and a done-when a coordinator can check. Do not start a later phase to avoid a red test in an earlier one.

### Now — Stabilize what already shipped

**Goal.** A parent can trust the four units and twelve songs on a real iPad, and on desktop Chrome when a MIDI keyboard exists. No new teaching topic.

**Work.**

- Run the scenarios in section 7 on the devices we claim. Write down passes and fails. This pass has not been formally signed off yet.
- iPad Safari: mic prompt, **Allow microphone** if it was blocked, on-screen keys, landscape, and Add to Home Screen from the production build.
- Desktop Chrome or Edge: a USB MIDI keyboard’s note-on plays the lesson. Confirm the MIDI pill names the device when the browser can.
- Offline: after one online load of the production build, the path still opens with the network off.
- Unlock pacing. Do not hand the child all six Home Steps songs the moment that unit has stars. Open one or two first (Hot Cross Buns and Mary Had a Little Lamb are the clearest), and hold the rest of that band until the child has played those. Keep the PIN unlock for a grown-up who wants to skip ahead.
- Make the shortest library motifs recognizable, still as our own simplified lines on C4–C5, still public-domain sources only. Priority: Spring, Brahms Lullaby, and Canon. Longer means a parent who knows the tune can hear it. It does not mean a full movement, a second hand, or a new song.
- Leave the in-repo license notes in place, and keep calling them a checklist, not a legal opinion.

**Why this matches learning.** A method book does not dump six pieces on the child after the first page, and it does not call an eight-note line a piece. Broken mic, a dead offline icon, or a song that does not sound like its name will stop practice before pedagogy matters.

**Done when.** Every scenario in section 7 is a pass on the claimed devices, with iPad Safari MIDI recorded as the expected fail. The Home Steps band no longer opens six songs at once. Spring, Brahms Lullaby, and Canon are long enough to recognize. Piano has re-reviewed the change. The CEO does not merge while a scenario in this list is red.

### Next — Real rhythm

**Goal.** Steady Beats scores time and silence, not only “right pitch, then a timer.”

**Work.**

- Show the value in plain counting: quarter = 1, half = 2, whole = 4.
- A steady pulse the child can see, and a soft click a parent can turn down. The child should not have to guess a hidden timer.
- Hold until the beat. For a half or a whole, the key has to stay down (MIDI), or the tone has to stay present (mic), for the value. Letting go early does not advance.
- Rests stay quiet for the same counts. A sound during the rest is wrong and does not complete the rest. That part already restarts the wait; keep it, and make the length match the pulse.
- Songs and units that are not rhythm units still advance on the matching pitch. Do not punish Hot Cross Buns with a hold test it was not written for.

**Why this matches learning.** Rhythm is time, not a label printed on a note. Children who only tap the right key learn to move on. Counting and holding are the primer skill.

**Done when.** On Quiet Clock, the right pitch released immediately does not complete a half or a whole. A rest completes only if the child is quiet for that value. A note during the rest does not count as the rest. A parent can see or hear the pulse. A non-rhythm song still advances on pitch alone. Section 7’s lesson checks still pass, and new rhythm checks are added to the same log before the phase is called done.

### Then — Reading growth, still in the first position

**Goal.** The child reads a step and a skip on the treble staff, with a finger ready, without leaving C–D–E–F–G–A–B–high C.

**What is already there.** Home Steps and Neighbor Notes name those pitches. Finger numbers exist and default to on. The lesson copy already says where A, B, and high C sit (second space, third line, third space). Use that. Do not rebuild it.

**Work.**

- Say “step” and “skip” in the lesson, from a landmark the child already knows, instead of only letter names.
- Use finger numbers on the melody stages on purpose, not only as a checkbox. Right hand stays 1–5 in this position. Left hand stays labeled LH until the bass phase.
- Name two intervals the child can already play: a step (next-door notes) and a skip (a third), plus the open fifth they meet as left-hand C and G. Name them in ordinary words.
- Stay on white keys in this position. No ledger-line tour. No black-key unit in this phase.

**Why this matches learning.** Reading is a landmark plus a step or a skip. Finger numbers let the eyes stay on the staff. New letters outside the position would skip the skill.

**Done when.** A stage asks for a step and a skip by sight, finger numbers visible, and a wrong key does not advance. Every new note is still inside the current white-key position.

### Then — Left hand and bass clef, then true hands-together

**Goal.** The left hand can read a few bass-clef notes alone. Then both hands sound together once, on purpose, in a very easy piece.

**What is already there.** Two Hands Hello is turn-taking: low C, low G, then a right-hand wave (Low Door), on a wider keyboard. It is not bass-clef reading, and it is not both hands at once. Keep it. It is the “hands take turns” step. Do not replace it with a harder duet.

**Work.**

- A short left-hand unit: bass clef, one landmark (low C or the bass F line), a few notes, right hand silent.
- After that unit is easy, one together step. Prefer one hand holding while the other plays, or both hands on the same simple rhythm. One moment of true together is enough. Not a duet.

**Why this matches learning.** Taking turns and playing together are different skills. Books separate them. Bass clef is its own landmark, not “the low keys on a wide picture.”

**Done when.** The child can play the new left-hand notes from the bass staff with the right hand silent. They can finish one piece that asks both hands to sound together at least once. A note in the wrong hand does not advance. Two Hands Hello still exists as the turn-taking step before that.

### Then — Musicality, and a deeper public-domain library

**Goal.** The child can shape a phrase, and the library holds pieces long enough to practice in sections.

**Work.**

- Dynamics in words the child already hears at lessons: soft and loud. Be honest about scoring. A MIDI keyboard can use how hard the key was struck. A microphone in a living room cannot reliably judge loudness. For mic practice, show the word and the demo, and do not pretend a decibel check passed. Do not block the piece forever on loudness.
- Articulation only where we can tell the truth. If we cannot yet tell legato from a short tap, teach it in the demo and do not award a star for it.
- Longer public-domain pieces, still our arrangements, still no pop or Disney. Learn them in sections (a phrase, then the next), not as a single 4-note snippet. Canon, Spring, and Brahms are the first candidates once the “Now” phase has made them recognizable. Two Hands Hello still does not need a licensed bass line.

**Why this matches learning.** Dynamics and articulation are how the line speaks, and they come after notes and rhythm. A piece learned in sections is how children finish real music.

**Done when.** At least one library piece has two sections the child plays in order. A dynamic marking is visible, and MIDI practice responds to it without blocking a mic-only child unfairly. No new copyrighted catalog.

### Later — Reports, ear, and difficulty

Only after the phases above are done, and only if a parent still wants them.

- A parent practice report: which units and songs, stars, and time. On this device first. No account required for that.
- Light ear work: same or different, higher or lower. After reading is stable, so the ear game does not replace the staff.
- Adaptive difficulty in the small sense: after repeated misses, keep the hint a little longer or offer the same pattern again. Never a pay-to-skip, never an energy gate.

**Out of scope for a long time**

- A store, purchases, loot boxes, or energy.
- Ads, a social feed, chat, or child accounts.
- Cloud sync or accounts, unless parents ask (see section 8).
- Multiplayer.
- Licensed pop, Disney, film, game, or commercial method-book catalogs.
- Copying another app’s characters or UI.

## 7. Testing plan CEO and Piano can run without a lab

Piano re-reviews the pull request. The CEO does not merge while a scenario below is red. A fail becomes a GitHub issue, or a cloud-agent follow-up, on `Cheezwedge/piano-app`. Re-test that scenario before the phase is called done.

### How to run

On a computer, from a terminal:

```bash
git clone https://github.com/Cheezwedge/piano-app.git
cd piano-app
git checkout main
npm install
npm run dev
```

`npm run dev` already starts Vite with `--host`. The terminal prints a localhost URL (usually `http://localhost:5173`) and a Network URL. Use the localhost URL on that computer. Use the Network URL on an iPad joined to the same Wi-Fi. Hold the iPad in landscape.

The dev server is for day-to-day checks. It is not the offline test. For offline and Add to Home Screen:

```bash
npm run build
npm run preview
```

`preview` also uses `--host`. On the iPad, open that Network URL in Safari once while online, then Share → Add to Home Screen. On Chrome or Edge, use Install app. After that, turn Wi-Fi off and open the home-screen icon.

To start over on a device: grown-up settings → **Reset this device** (erases the PIN, profiles, and progress in this browser). Or clear site data for that origin. Progress does not follow the child to another browser.

Have two things ready when you can: a real piano or keyboard near the iPad mic, and a USB MIDI keyboard on a desktop Chrome or Edge machine. If you do not have MIDI hardware, mark scenario S6 as not run, not as a pass.

### What to log on a fail

One note per fail. Include:

- Build: `main` or the commit from `git rev-parse --short HEAD`, plus the date and time (PT).
- Device and browser (example: iPad, Safari; or laptop, Chrome).
- Scenario id (S1, S2, …).
- Expected and actual, in a sentence each.
- A screenshot or a short note of the banner text and the note counter (`3 / 9` or similar).

### Scenarios

Use on-screen keys unless the scenario says mic or MIDI. That way a wrong note is deliberate.

**S1 — First-run PIN and kid profile**

- Setup: fresh site data. Open the app.
- Steps: Tap **I am the grown-up**. Enter a PIN of 4, 5, or 6 digits, type it again, **Save PIN**. Enter a first name, pick an avatar, **Save profile**.
- Pass: Home screen shows that child’s name, **Start Home Steps**, and Neighbor Notes (and the later units) as **Locked**. No store, no ad.
- Fail: PIN of 3 or 7 digits is accepted; home appears with no child; a later unit is already **Start** without a grown-up unlock.

**S2 — Lesson 1 waits for the right note**

- Setup: from home, **Start Home Steps**. On the demo, tap **I am ready** (you may tap **Play demo** first; it is not required for this check). You are on **Find each key**.
- Steps: Tap a key that is not the one asked. Then tap the key that is asked. Watch the counter (`1 / 5` at the start of that step).
- Pass: The wrong key shows a wrong / “Try again” response and the counter does not move. The right key moves the counter by one. Coral means it stayed. The lesson does not skip.
- Fail: A wrong key advances the counter, or the right key does nothing.

**S3 — Color and hint**

- Setup: finish or skip ahead inside Home Steps until the melody **Garden Walk** (the third step; hints start hidden). Finger numbers may be on or off; this check is the color.
- Steps: (a) As soon as a note is asked, and before **Show hint** and before about five seconds, play the right on-screen key. (b) On the next note, tap **Show hint** or wait until the target key highlights, then play the right key. (c) On another note, play a wrong key.
- Pass: (a) green, “Yes — first try,” and the lesson advances. (b) gold, “Yes — after a hint,” and the lesson advances. (c) coral, “Try again,” and the counter does not move. The home-screen legend matches: Correct `#2F8F5B`, Correct after hint `#D4A017`, Wrong `#C44B3C`.
- Fail: A hinted success is scored as first-try green, or a wrong key is scored green or gold, or a wrong key advances.
- Note: the guided step **Find each key** shows the hint immediately, so its successes are gold. That is expected. Do not use that step to look for a green.

**S4 — Mic permission retry**

- Setup: iPad Safari, a real piano, lesson started past the demo so listening is on.
- Steps: When Safari asks for the microphone, choose Don’t Allow once. Read the Mic pill. Tap **Allow microphone**. If Safari will not re-ask, allow the mic in iPad Settings for Safari, then return and tap **Allow microphone** again. Play one clear middle C (calibrate first from grown-up settings if the room piano is off pitch: **Calibrate microphone** / Listen for middle C).
- Pass: After a block, the page says the microphone is blocked and still offers **Allow microphone**. MIDI and on-screen keys still work while it is blocked. After permission, the Mic pill leaves the error state, and a single clear piano note can satisfy the current target.
- Fail: The lesson is stuck with no retry, or a blocked mic also kills the on-screen keys.
- Not a fail: a noisy room or two notes at once mapping to the wrong pitch. Write that down as mic conditions, and retry with one note held plainly.

**S5 — On-screen keys**

- Setup: any device, lesson in progress, mic and MIDI unplugged or ignored.
- Steps: Play three correct targets only by tapping the on-screen keyboard.
- Pass: Each tap is heard, the counter advances only on the asked key, and the target key is highlighted when a hint is allowed.
- Fail: Taps do nothing, or the highlighted key is not the note named on the staff.

**S6 — MIDI on desktop Chrome, when a keyboard exists**

- Setup: desktop Chrome or Edge, page on localhost or HTTPS, USB MIDI keyboard connected. Start a lesson past the demo.
- Steps: Allow MIDI if the browser asks. Play the asked note on the hardware keyboard. Then play a wrong hardware note.
- Pass: The MIDI pill shows listening (and the device name if the browser provides it). The right note advances. The wrong note does not. The banner can show the input source.
- Fail: Hardware notes do nothing while the pill claims listening, or wrong hardware notes advance.
- If no MIDI keyboard is in the room: log “S6 not run,” not “S6 pass.”

**S7 — MIDI on iPad Safari is expected to fail**

- Setup: iPad Safari, lesson past the demo. A MIDI keyboard is optional; Safari still has no Web MIDI.
- Steps: Look at the MIDI pill. Try to play a hardware keyboard only if one is attached. Then play the asked note on the on-screen keys.
- Pass: The MIDI pill is an error or otherwise not “listening” to a hardware keyboard. The on-screen key still advances the lesson. This is a pass, not a bug to file, unless on-screen keys also died.
- Fail: Filing this as a broken iPad, or on-screen practice no longer works.

**S8 — Session limit**

- Setup: grown-up settings (PIN) → session time → **10 min**. Note the time you set it. Stay on the home screen with that kid active. Do not expect **Start** to reset the clock. The timer already runs on the home screen.
- Steps: Wait until the limit. Read the screen. Enter the PIN and tap **Go home**. Start again, and this time use **Add more time**.
- Pass: Practice pauses with “Practice time is done.” The child cannot keep playing the lesson without the PIN. **Go home** and **Add more time** both require the PIN (unless the two-minute parent window is already open).
- Fail: The lesson keeps accepting notes after the limit, or **Add more time** works with no PIN.
- This scenario takes about ten minutes. Do not call it a pass because the button exists.

**S9 — Switching kids asks for the PIN**

- Setup: two profiles. In grown-up settings, **Add another kid**, save a second name. Return home. Wait out the two-minute parent window, or reload, so the pad is not already unlocked.
- Steps: Tap the other child’s avatar on the home screen. Enter a wrong PIN once. Then enter the right PIN.
- Pass: The wrong PIN does not switch. The right PIN switches, and the home screen shows the other name. Stars on the path belong to that child, not the first child.
- Fail: The avatar switches with no PIN, or the second child inherits the first child’s stars.

**S10 — Song locked, then unlocked**

- Setup: a new child who has not finished Home Steps. Open **Open song library**.
- Steps: Confirm Hot Cross Buns (and the other Home Steps songs) show **Locked** and **Grown-up unlock**, not **Play**. Go back, finish Home Steps all the way through Garden Walk until the celebration. Open the library again. Open Twinkle Twinkle without finishing Neighbor Notes.
- Pass: Before Home Steps is finished, those songs do not start. After it is finished, Hot Cross Buns offers **Play** and does not ask for a PIN. Twinkle (and the other Neighbor Notes songs) stay **Locked** until Neighbor Notes has stars. **Grown-up unlock** on a locked card asks for the PIN and then that one song can play.
- Fail: A locked song starts with no PIN and no finished unit, or finishing Home Steps also unlocks Twinkle, or an unlocked song demands the PIN just to play.

**S11 — A full song plays through and celebrates**

- Setup: Hot Cross Buns unlocked (S10). Tap **Play**.
- Steps: On **Hear the song**, you may tap through the demo. On **Play the song**, play every note in order, including the held C at the end, using on-screen keys. You may use **Show hint**.
- Pass: The counter reaches the end, a short celebration plays, stars are offered, and **Back to songs** returns to the library. The song’s star count on the card is no longer empty. Leaving early via **Leave** asks for the PIN and does not celebrate.
- Fail: The song ends with no celebration, stars do not stick after you go back, or **Leave** exits with no PIN.

**S12 — Offline after install**

- Setup: `npm run build` and `npm run preview`, not the dev server. iPad or desktop has opened that URL once while online, and the app is added to the home screen or installed.
- Steps: Turn the network off. Open the home-screen icon. Start Home Steps and play one on-screen note.
- Pass: The app opens and the on-screen lesson accepts a note. No request to “go online” for the course itself.
- Fail: The icon opens a browser error, or the lesson shell never loads.
- Not this test: `npm run dev`. The dev server is not the service worker.

**S13 — No ads, store, or social surfaces**

- Setup: walk welcome, home, library, a lesson, celebration, time-up, and grown-up settings.
- Steps: Look for buy buttons, prices, loot, energy, ads, share-to-social, chat, or a child login.
- Pass: Settings includes the line that Home Keys has no ads, in-app purchases, social accounts, or store links, and the screens you walked do not contradict it. Rewards are stickers, colors, and badges. Warm Cream is free. Locked looks say a level, not a price.
- Fail: Any purchase, ad, energy block, or social/share/chat control.

### Feedback loop

1. Log the fail as in “What to log,” the same day.
2. Open a GitHub issue on `Cheezwedge/piano-app`, or hand the same note to a cloud-agent follow-up on that repo. The issue title starts with the scenario id (`S4 mic retry does not return from Settings`). Paste expected vs actual. Do not widen the issue into a new phase.
3. The fix is a pull request. Piano re-reviews it.
4. Re-run that scenario on the same kind of device before anyone calls the phase done. A pass on a laptop does not clear an iPad fail.
5. The CEO does not merge while that scenario is still red. Unlock-entire-path and unlock-entire-library are for the tester to reach a later screen. They are not a pass for S10.

## 8. Open decisions

Three choices are still open. They do not block the “Now” phase.

**PIN length.** The app already accepts 4, 5, or 6 digits. The pad is a child gate, not a bank password. Requiring 6 would slow a child a bit more and make first-run slightly fussier. Keeping 4 as an allowed length matches what shipped. Decide before any copy change on the setup screen: keep 4–6 as it is, or require 6. Do not do both in the interface.

**Parent reports and accounts.** A report that lives on this tablet does not need an account, and the “Later” phase should start there. A report on a parent’s phone, or progress that survives a new browser, needs an account and a server. Do not build that unless parents ask. Asking is the decision, not a default.

**Songs or rhythm first.** Rhythm scoring comes before any new thirteenth piece. In the “Now” phase, lengthen Spring, Brahms Lullaby, and Canon, and slow the unlock of the six Home Steps songs. Do not add more titles until Steady Beats can tell a held note from a tap. More short songs would repeat the current gap.
