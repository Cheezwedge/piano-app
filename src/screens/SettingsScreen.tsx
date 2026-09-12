import { useState } from "react";
import { ColorLegend } from "../components/ColorLegend";
import { isValidPin } from "../lib/pin";
import { useApp } from "../store/AppState";

const LIMITS = [0, 10, 15, 20, 30];

export function SettingsScreen() {
  const { persist, updateSettings, removeKid, setScreen, setPin, resetAll } = useApp();
  const [pin, setPinValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const changePin = async () => {
    if (!isValidPin(pin) || pin !== confirm) {
      setMessage("Enter the same 4-digit PIN twice.");
      return;
    }
    await setPin(pin);
    setPinValue("");
    setConfirm("");
    setMessage("PIN updated.");
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
          The timer runs whenever a kid profile is active — home and Lesson 1. When it ends, practice
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
          Show right-hand finger numbers (1–5)
        </label>
        <button type="button" className="btn ghost" onClick={() => setScreen("calibrate")}>
          Calibrate microphone
        </button>
        <p className="muted">
          Current pitch offset: {persist.calibrationCents.toFixed(0)} cents
        </p>
      </section>

      <section>
        <h2>Kid profiles</h2>
        <ul className="kid-list">
          {persist.kids.map((kid) => (
            <li key={kid.id}>
              <span>
                {kid.avatar} {kid.name}
              </span>
              <button type="button" className="btn tiny" onClick={() => removeKid(kid.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn ghost" data-testid="add-kid" onClick={() => setScreen("setup-kid")}>
          Add another kid
        </button>
      </section>

      <section>
        <h2>Change PIN</h2>
        <div className="row-fields">
          <input
            data-testid="settings-pin"
            inputMode="numeric"
            maxLength={4}
            placeholder="New PIN"
            value={pin}
            onChange={(event) => setPinValue(event.target.value.replace(/\D/g, "").slice(0, 4))}
          />
          <input
            data-testid="settings-pin-confirm"
            inputMode="numeric"
            maxLength={4}
            placeholder="Again"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value.replace(/\D/g, "").slice(0, 4))}
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
