import { Logo } from "../components/Logo";
import { useApp } from "../store/AppState";

export function WelcomeScreen() {
  const { setScreen } = useApp();

  return (
    <main className="page welcome" data-testid="welcome-screen">
      <Logo size={72} />
      <h1>Home Keys</h1>
      <p className="lede">
        A quiet first piano lesson for kids at home. Real keys, a treble staff, and no ads.
      </p>
      <ul className="welcome-points">
        <li>Lesson 1 reads C D E F G on the treble staff</li>
        <li>Practice waits for the correct note</li>
        <li>Parents keep a PIN on settings and leaving early</li>
      </ul>
      <button
        type="button"
        className="btn primary xl"
        data-testid="welcome-start"
        onClick={() => setScreen("setup-pin")}
      >
        I am the grown-up
      </button>
    </main>
  );
}
