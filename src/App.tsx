import { useEffect, useState, type ReactElement } from "react";
import { sessionExpired } from "./lib/session";
import { TimeUpScreen } from "./screens/TimeUpScreen";
import { CalibrateScreen } from "./screens/CalibrateScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LessonScreen } from "./screens/LessonScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SetupKidScreen, SetupPinScreen } from "./screens/SetupScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { useApp } from "./store/AppState";

export function App() {
  const { persist, screen, setScreen, sessionStartedAt } = useApp();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const limitMs = persist.sessionLimitMinutes * 60 * 1000;
  const timedOut =
    screen === "lesson" && sessionExpired(sessionStartedAt, persist.sessionLimitMinutes, now);

  const remaining =
    sessionStartedAt && persist.sessionLimitMinutes > 0
      ? Math.max(0, limitMs - (now - sessionStartedAt))
      : null;

  let body: ReactElement;
  switch (screen) {
    case "welcome":
      body = <WelcomeScreen />;
      break;
    case "setup-pin":
      body = <SetupPinScreen />;
      break;
    case "setup-kid":
      body = <SetupKidScreen nextScreen={persist.kids.length ? "settings" : "home"} />;
      break;
    case "settings":
      body = <SettingsScreen />;
      break;
    case "calibrate":
      body = <CalibrateScreen />;
      break;
    case "lesson":
      body = <LessonScreen />;
      break;
    default:
      body = <HomeScreen />;
  }

  return (
    <div className="app-shell" data-testid="app-shell">
      {remaining != null && screen === "lesson" ? (
        <div className="session-chip" data-testid="session-remaining">
          {formatRemaining(remaining)}
        </div>
      ) : null}
      {body}
      {timedOut ? (
        <TimeUpScreen
          onHome={() => {
            setScreen("home");
          }}
        />
      ) : null}
    </div>
  );
}

function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
