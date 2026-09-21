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
        <li>A short course path: notes, neighbors, rhythm, then a light two-hand hello</li>
        <li>A song library of free-to-use classical and folk teaching pieces</li>
        <li>Practice waits for the correct note</li>
        <li>Parents keep a PIN on settings, progress resets, and leaving early</li>
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
