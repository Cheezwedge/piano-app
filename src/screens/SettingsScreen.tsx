import { useState } from "react";
import { ColorLegend } from "../components/ColorLegend";
import { COURSE_UNITS } from "../data/courses";
import { LIBRARY_SONGS } from "../data/songs";
import { isValidPin } from "../lib/pin";
import { levelFromXp } from "../lib/progress";
import { useApp } from "../store/AppState";

const LIMITS = [0, 10, 15, 20, 30];

export function SettingsScreen() {
  const {
    persist,
    updateSettings,
    removeKid,
    setScreen,
    setPin,
    resetAll,
    unlockPath,
    unlockLibrary,
    resetKidProgress,
  } = useApp();
  const [pin, setPinValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const changePin = async () => {
    if (!isValidPin(pin) || pin !== confirm) {
      setMessage("Enter the same 4 to 6 digit PIN twice.");
      return;
    }
    await setPin(pin);
    setPinValue("");
    setConfirm("");
    setMessage(`PIN updated (${pin.length} digits).`);
  };

  return (
    <main className="page settings" data-testid="settings-screen">
      <header className="topbar">
        <h1>Grown-up settings</h1>
        <button type="button" className="btn ghost" data-testid="close-settings" onClick={() => setScreen("home")}>
          Done
        </button>
      </header>

      <section>
        <h2>Session time</h2>
        <p className="muted">
          The timer runs whenever a kid profile is active — home and lessons. When it ends, practice
          pauses until a PIN is entered. 0 means no limit.
        </p>
        <div className="choice-row">
          {LIMITS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              className={persist.sessionLimitMinutes === minutes ? "chip selected" : "chip"}
              data-testid={`limit-${minutes}`}
              onClick={() => updateSettings({ sessionLimitMinutes: minutes })}
            >
              {minutes === 0 ? "No limit" : `${minutes} min`}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Lesson help</h2>
        <label className="toggle">
          <input
            type="checkbox"
            checked={persist.showFingerNumbers}
            data-testid="finger-toggle"
            onChange={(event) => updateSettings({ showFingerNumbers: event.target.checked })}
          />
          Show finger numbers (right 1–5, left labeled)
        </label>
        <button type="button" className="btn ghost" onClick={() => setScreen("calibrate")}>
          Calibrate microphone
        </button>
        <p className="muted">
          Current pitch offset: {persist.calibrationCents.toFixed(0)} cents
        </p>
      </section>

      <section>
        <h2>Course path</h2>
        <p className="muted">
          Kids open the next stage after they finish the one before it. Unlock-all is for testing only.
        </p>
        <div className="choice-row">
          <button
            type="button"
            className={persist.pathUnlocked ? "chip selected" : "chip"}
            data-testid="unlock-path"
            onClick={unlockPath}
          >
            Unlock entire path
          </button>
          {persist.pathUnlocked ? (
            <button
              type="button"
              className="chip"
              data-testid="lock-path"
              onClick={() => updateSettings({ pathUnlocked: false })}
            >
              Lock path again
            </button>
          ) : null}
        </div>
      </section>

      <section>
        <h2>Song library</h2>
        <p className="muted">
          Songs open when the matching course stage is finished. Unlock-all is for testing, or to skip the stage
          gates. Kids still do not need the PIN to play an unlocked song.
        </p>
        <div className="choice-row">
          <button
            type="button"
            className={persist.libraryUnlocked ? "chip selected" : "chip"}
            data-testid="unlock-library"
            onClick={unlockLibrary}
          >
            Unlock entire library
          </button>
          {persist.libraryUnlocked ? (
            <button
              type="button"
              className="chip"
              data-testid="lock-library"
              onClick={() => updateSettings({ libraryUnlocked: false })}
            >
              Lock library again
            </button>
          ) : null}
        </div>
      </section>

      <section>
        <p className="muted">Kids cannot reset stars or XP from their path. That stays here, behind the PIN.</p>
        <ul className="kid-list">
          {persist.kids.map((kid) => (
            <li key={kid.id}>
              <div>
                <strong>
                  {kid.avatar} {kid.name}
                </strong>
                <p className="muted">
                  Level {levelFromXp(kid.xp)} · {kid.xp} XP
                  {kid.streakDays ? ` · ${kid.streakDays}-day streak` : ""}
                </p>
                <p className="muted">
                  {COURSE_UNITS.map((unit) => {
                    const stars = kid.stageStars[unit.id] ?? 0;
                    return `${unit.title}: ${stars ? `${stars}★` : "—"}`;
                  }).join(" · ")}
                </p>
                <p className="muted">
                  Songs:{" "}
                  {LIBRARY_SONGS.map((song) => {
                    const stars = kid.stageStars[song.id] ?? 0;
                    return `${song.title}: ${stars ? `${stars}★` : "—"}`;
                  }).join(" · ")}
                </p>
              </div>
              <div className="choice-row">
                <button
                  type="button"
                  className="btn tiny"
                  data-testid={`reset-progress-${kid.id}`}
                  onClick={() => {
                    if (window.confirm(`Reset ${kid.name}'s stars, XP, streak, and cosmetics?`)) {
                      resetKidProgress(kid.id);
                    }
                  }}
                >
                  Reset progress
                </button>
                <button type="button" className="btn tiny" onClick={() => removeKid(kid.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" className="btn ghost" data-testid="add-kid" onClick={() => setScreen("setup-kid")}>
          Add another kid
        </button>
      </section>

      <section>
        <h2>Change PIN</h2>
        <p className="muted">4, 5, or 6 digits. Rate limits and the two-minute unlock window stay the same.</p>
        <div className="row-fields">
          <input
            data-testid="settings-pin"
            inputMode="numeric"
            maxLength={6}
            placeholder="New PIN"
            value={pin}
            onChange={(event) => setPinValue(event.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <input
            data-testid="settings-pin-confirm"
            inputMode="numeric"
            maxLength={6}
            placeholder="Again"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <button type="button" className="btn ghost" onClick={() => void changePin()}>
            Update
          </button>
        </div>
        {message ? <p className="muted">{message}</p> : null}
      </section>

      <section>
        <h2>Color mapping</h2>
        <ColorLegend />
      </section>

      <section>
        <h2>This app stays local</h2>
        <p>
          Home Keys has no ads, in-app purchases, social accounts, or store links. Progress lives in this
          browser only.
        </p>
        <button
          type="button"
          className="btn danger"
          onClick={() => {
            if (window.confirm("Erase PIN, profiles, and progress on this device?")) resetAll();
          }}
        >
          Reset this device
        </button>
      </section>
    </main>
  );
}
