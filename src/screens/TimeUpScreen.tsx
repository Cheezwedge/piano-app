import { useState } from "react";
import { PinPad } from "../components/PinPad";
import { useApp } from "../store/AppState";

interface Props {
  onHome: () => void;
}

export function TimeUpScreen({ onHome }: Props) {
  const { checkPin, extendSession, isParentUnlocked } = useApp();
  const [mode, setMode] = useState<"pick" | "extend" | "home">("pick");

  const finish = (next: "extend" | "home") => {
    if (next === "home") onHome();
    else extendSession();
  };

  if (mode === "pick") {
    return (
      <div className="pin-overlay" data-testid="time-up">
        <div className="pin-card">
          <h2>Practice time is done</h2>
          <p className="muted">A grown-up PIN is needed to keep going or to leave.</p>
          <div className="row-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={() => (isParentUnlocked() ? finish("home") : setMode("home"))}
            >
              Go home
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={() => (isParentUnlocked() ? finish("extend") : setMode("extend"))}
            >
              Add more time
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PinPad
      title={mode === "home" ? "Go home" : "Add more time"}
      subtitle="Enter the grown-up PIN."
      submitLabel={mode === "home" ? "Go home" : "Continue"}
      onCancel={() => setMode("pick")}
      onSubmit={async (pin) => {
        const result = await checkPin(pin);
        if (result.ok) finish(mode);
        return result;
      }}
    />
  );
}
