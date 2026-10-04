# Home Keys sign-off log

First pass on what already shipped. No rhythm work. Nothing merged.

- Repo: https://github.com/Cheezwedge/piano-app
- Branch: `main`
- Commit: `1f283c3da6d9dd7c222873474d5a80b1caf518a6` (`1f283c3`, merge of PR #2)
- When: Saturday, Oct 3, 2026, about 9:11–9:32 PM PT
- Where: desktop Chrome on the test computer. Not an iPad. No USB MIDI keyboard. No acoustic piano.
- How: `npm install`, then `npm run dev` at http://localhost:5173/ for S1–S11 and S13. S12 used `npm run build` and `npm run preview` at http://localhost:4173/, then the preview server was stopped and the same tab was reloaded.
- PIN used: 1234. Profiles: Ada, then Ben.

A scenario is a pass only for the environment named here. iPad Safari and a hardware keyboard were not in the room, so those rows are not run.

## Results

| Id | Result | Expected | Actual |
| --- | --- | --- | --- |
| S1 | PASS | Fresh PIN and kid, Home Steps startable, later units locked, no store or ad. | Home showed Ada, Start Home Steps, Neighbor Notes and later units Locked. No store, price, or ad. Setup said “Use 4, 5, or 6 digits.” A 3-digit PIN was not tried after 1234 was saved. |
| S2 | PASS | Wrong note does not advance. Right note advances by one. | Wrong D4: “Try again · heard D4.” at 1 / 5. Correct C4: “Yes — after a hint.” and 2 / 5. |
| S3 | PASS | Garden Walk: first try, after hint, and a wrong note that does not advance. | “Yes — first try.” advanced. “Yes — after a hint.” went from 2 / 9 to 3 / 9. “Try again · heard D4.” stayed at 3 / 9. |
| S4 | PASS for the retry control. Piano half NOT RUN. | Blocked mic still offers Allow microphone, and on-screen keys still work. A real piano note is a separate check. | Mic pill: “Permission needed.” Copy: “The microphone is blocked. Home Keys can still use MIDI or the on-screen keys.” On-screen F4 still advanced. Tapping Allow microphone did not open a browser permission prompt, and the mic stayed blocked. No iPad and no piano, so pitch detection was not tested. |
| S5 | PASS | Three correct on-screen targets advance only when they match. | D4, E4, and F4 advanced through 3 / 5, 4 / 5, and 5 / 5. The highlighted key matched the asked note. |
| S6 | NOT RUN | Desktop Chrome plus a USB MIDI keyboard. | No MIDI keyboard on this computer. The pill once read “MIDI Starting…”. That is not a pass. |
| S7 | NOT RUN | iPad Safari MIDI is expected not to listen; on-screen keys should still work. | No iPad. Do not file this as a bug, and do not mark it passed. |
| S8 | PASS | After the limit, practice stops. Go home and Add more time both need the PIN. | Before the change, the session chip read 10:41 remaining. Limit set to 10 min. The time-up screen appeared after about 5 minutes 10 seconds of waiting (the clock had already been running). Banner: “Practice time is done” / “A grown-up PIN is needed to keep going or to leave.” Go home and Add more time both asked for 1234. After Go home, a restarted lesson accepted a note (“Yes — after a hint.”). |
| S9 | PASS | Wrong PIN does not switch. Right PIN switches, and stars stay with the child. | 0000: “That PIN does not match. 4 tries left.” Ada stayed. 1234 showed Ben. Ben was at 0 / 100 XP, not Ada’s progress. |
| S10 | PASS | Hot Cross Buns locked until Home Steps is finished. Twinkle stays locked. | Before finish: Locked and Grown-up unlock. After “Ada, you finished Home Steps,” Hot Cross Buns showed Play and did not ask for a PIN. Twinkle stayed Locked. Unlock-entire-path was not used. |
| S11 | PASS | Full song, celebration, stars stick, Leave asks for the PIN. | “Ada, you finished Hot Cross Buns,” three stars, Back to songs. The card showed three stars and Play again. Leave showed “Leave song?” and “A grown-up PIN is needed to exit before you finish.” |
| S12 | PASS on desktop Chrome only. | After one online load of the production build, the lesson still opens with the server off. | Not an iPad, and not Add to Home Screen. After the preview server was stopped, reload of http://localhost:4173/ opened Home Keys from cache, including Start Home Steps. The lesson loaded “Home Steps · Find each key” with no error and no go-online wall. On-screen C4 advanced the counter to 2 / 5. |
| S13 | PASS | No ads, store, energy, or social. | Settings: “Home Keys has no ads, in-app purchases, social accounts, or store links.” Rewards were looks such as “Sunny Seed Level 2.” Locked songs said Grown-up unlock, not a price. |

## What this does not sign off

- iPad Safari, Add to Home Screen, or a real piano into the mic.
- A USB or Bluetooth MIDI keyboard.
- The mic permission prompt actually returning after a block. The button was there. This Chrome session did not show the browser prompt again.
- Rhythm scoring. That build was not started.

## Feedback loop

No scenario that we could run failed. Nothing new to file on the repo from this pass.

Still open, and not bugs until a device is in the room:

1. S6, when a MIDI keyboard is on desktop Chrome.
2. S7, on a real iPad in Safari. Expected result is MIDI not listening, on-screen keys still working.
3. S4 piano half, and whether Allow microphone can re-prompt in iPad Settings after Don’t Allow.
4. S12 on an iPad home-screen icon with Wi-Fi off.

Re-test those on that device before calling the “Now” phase done. Do not merge a later change against a red row from that device.
