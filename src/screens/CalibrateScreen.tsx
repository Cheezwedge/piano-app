import { useState } from "react";
import { measureMiddleC } from "../audio/pitch";
import { resumeAudio } from "../audio/synth";
import { useApp } from "../store/AppState";

export function CalibrateScreen() {
  const { persist, updateSettings, setScreen } = useApp();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Play and hold middle C on your piano.");

  const listen = async () => {
    setBusy(true);
    setMessage("Listening for middle C…");
    try {
      await resumeAudio();
      const cents = await measureMiddleC(2200);
      if (cents == null) {
        setMessage("No steady pitch yet. Try again closer to the microphone, or use MIDI.");
      } else {
        updateSettings({ calibrationCents: cents });
        setMessage(`Saved. Offset is ${cents.toFixed(0)} cents from concert middle C.`);
      }
    } catch {
      setMessage("Microphone permission is required for calibration.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page narrow" data-testid="calibrate-screen">
      <h1>Mic calibration</h1>
      <p>
        Home Keys expects concert pitch (A4 = 440). Play middle C so we can learn this room and this piano.
      </p>
      <p className="muted">{message}</p>
      <p className="muted">Stored offset: {persist.calibrationCents.toFixed(0)} cents</p>
      <div className="row-actions">
        <button type="button" className="btn ghost" onClick={() => setScreen("settings")}>
          Back
        </button>
        <button type="button" className="btn primary" disabled={busy} onClick={() => void listen()}>
          {busy ? "Listening…" : "Listen for middle C"}
        </button>
      </div>
    </main>
  );
}
