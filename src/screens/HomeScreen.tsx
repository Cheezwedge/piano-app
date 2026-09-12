import { useState } from "react";
import { ColorLegend } from "../components/ColorLegend";
import { Logo } from "../components/Logo";
import { PinPad } from "../components/PinPad";
import { useActiveKid, useApp } from "../store/AppState";

export function HomeScreen() {
  const { persist, setScreen, setActiveKid, checkPin, unlockParent, beginSession } = useApp();
  const kid = useActiveKid();
  const [gate, setGate] = useState<"settings" | null>(null);

  return (
    <main className="page home" data-testid="home-screen">
      <header className="topbar">
        <div className="brand">
          <Logo size={40} />
          <div>
            <strong>Home Keys</strong>
            <span>At-home piano primer</span>
          </div>
        </div>
        <button
          type="button"
          className="btn ghost"
          data-testid="open-settings"
          onClick={() => setGate("settings")}
        >
          Grown-up settings
        </button>
      </header>

      <section className="profile-strip">
        {persist.kids.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === kid?.id ? "chip selected" : "chip"}
            data-testid={`kid-chip-${item.id}`}
            onClick={() => setActiveKid(item.id)}
          >
            <span>{item.avatar}</span>
            {item.name}
          </button>
        ))}
      </section>

      <section className="lesson-card" data-testid="lesson-card">
        <p className="eyebrow">Ready when you are</p>
        <h1>Lesson 1 · First five notes</h1>
        <p>
          Hello {kid?.name ?? "friend"}. We will read C, D, E, F, and G on the treble staff, then play a
          tiny original walk called Garden Walk.
        </p>
        <button
          type="button"
          className="btn primary xl"
          data-testid="start-lesson"
          disabled={!kid}
          onClick={() => {
            beginSession();
            setScreen("lesson");
          }}
        >
          Start Lesson 1
        </button>
        {kid?.lesson1Complete ? <p className="success-text">Garden Walk finished — play it again any time.</p> : null}
      </section>

      <section className="info-grid">
        <article>
          <h2>How to play</h2>
          <p>
            Plug in a MIDI keyboard, or allow the microphone and play a real piano. You can also tap the
            on-screen keys while you set up.
          </p>
        </article>
        <article>
          <h2>Color feedback</h2>
          <ColorLegend />
        </article>
      </section>

      {gate === "settings" ? (
        <PinPad
          title="Grown-up PIN"
          subtitle="Settings stay behind this PIN."
          onCancel={() => setGate(null)}
          onSubmit={async (pin) => {
            const ok = await checkPin(pin);
            if (ok) {
              unlockParent();
              setGate(null);
              setScreen("settings");
            }
            return ok;
          }}
        />
      ) : null}
    </main>
  );
}
