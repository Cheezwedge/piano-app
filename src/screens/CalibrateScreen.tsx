import { useState } from "react";
import { listenLabel, type ListenChannel } from "../audio/listenStatus";
import { measureMiddleC } from "../audio/pitch";
import { resumeAudio } from "../audio/synth";
import { useApp } from "../store/AppState";

export function CalibrateScreen() {
  const { persist, updateSettings, setScreen } = useApp();
  const [channel, setChannel] = useState<ListenChannel>({
    status: "off",
    detail: "Play and hold middle C",
  });

  const listen = async () => {
    setChannel({ status: "calibrating", detail: "Play and hold middle C" });
    try {
      await resumeAudio();
      const cents = await measureMiddleC(2200);
      if (cents == null) {
        setChannel({ status: "error", detail: "No steady pitch. Try closer to the mic, or use MIDI." });
      } else {
        updateSettings({ calibrationCents: cents });
        setChannel({
          status: "detected",
          detail: `Saved · ${cents.toFixed(0)} cents from concert C`,
        });
      }
    } catch {
      setChannel({ status: "error", detail: "Mic permission is required for calibration." });
    }
  };

  return (
    <main className="page narrow" data-testid="calibrate-screen">
      <h1>Mic calibration</h1>
      <p>
        Home Keys expects concert pitch (A4 = 440). Play middle C so we can learn this room and this piano.
      </p>
      <p className={`listen-pill is-${channel.status}`} data-testid="calibrate-status">
        <span className="listen-dot" aria-hidden="true" />
        <strong>Mic</strong>
        <span>{listenLabel(channel)}</span>
      </p>
      <p className="muted">Stored offset: {persist.calibrationCents.toFixed(0)} cents</p>
      <div className="row-actions">
        <button type="button" className="btn ghost" onClick={() => setScreen("settings")}>
          Back
        </button>
        <button
          type="button"
          className="btn primary"
          disabled={channel.status === "calibrating"}
          onClick={() => void listen()}
        >
          {channel.status === "calibrating" ? "Calibrating…" : "Listen for middle C"}
        </button>
      </div>
    </main>
  );
}
