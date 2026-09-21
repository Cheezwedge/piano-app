import { useEffect, useState, type ReactElement } from "react";
import { isKidFacingScreen, sessionExpired, sessionShouldRun } from "./lib/session";
import { TimeUpScreen } from "./screens/TimeUpScreen";
import { CalibrateScreen } from "./screens/CalibrateScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LessonScreen } from "./screens/LessonScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
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

  const kidSession = sessionShouldRun(persist.activeKidId, persist.pinHash);
  const kidFacing = isKidFacingScreen(screen);
  const limitMs = persist.sessionLimitMinutes * 60 * 1000;
  const timedOut =
    kidFacing && sessionExpired(sessionStartedAt, persist.sessionLimitMinutes, now);

  const remaining =
    kidSession && persist.sessionLimitMinutes > 0 && sessionStartedAt
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
    case "library":
      body = <LibraryScreen />;
      break;
    default:
      body = <HomeScreen />;
  }

  return (
    <div className="app-shell" data-testid="app-shell" data-theme={activeTheme(persist)}>
      {remaining != null && kidFacing ? (
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

function activeTheme(persist: { kids: { id: string; theme?: string }[]; activeKidId: string | null }): string {
  const kid = persist.kids.find((item) => item.id === persist.activeKidId) ?? persist.kids[0];
  return kid?.theme ?? "cream";
}

function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
