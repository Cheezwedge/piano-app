import { useState } from "react";
import { ColorLegend } from "../components/ColorLegend";
import { Logo } from "../components/Logo";
import { PinPad } from "../components/PinPad";
import { COURSE_UNITS, UNIT_ORDER } from "../data/courses";
import { isUnitUnlocked, xpBar } from "../lib/progress";
import { REWARDS, type Reward } from "../lib/rewards";
import { useActiveKid, useApp } from "../store/AppState";

export function HomeScreen() {
  const { persist, setScreen, setActiveKid, setActiveUnitId, checkPin, isParentUnlocked, updateKid } =
    useApp();
  const kid = useActiveKid();
  const [gate, setGate] = useState<"settings" | { switchTo: string } | null>(null);
  const bar = xpBar(kid?.xp ?? 0);
  const stars = kid?.stageStars ?? {};

  const openSettings = () => {
    if (isParentUnlocked()) {
      setScreen("settings");
      return;
    }
    setGate("settings");
  };

  const requestSwitch = (id: string) => {
    if (id === kid?.id) return;
    if (isParentUnlocked()) {
      setActiveKid(id);
      return;
    }
    setGate({ switchTo: id });
  };

  const startUnit = (id: string) => {
    setActiveUnitId(id);
    setScreen("lesson");
  };

  const nextUnit =
    COURSE_UNITS.find(
      (unit) => isUnitUnlocked(unit.id, UNIT_ORDER, stars, persist.pathUnlocked) && !stars[unit.id],
    ) ?? COURSE_UNITS[0];

  const sticker = REWARDS.find((item) => item.id === kid?.sticker);
  const badge = REWARDS.find((item) => item.id === kid?.badge);

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
          onClick={openSettings}
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
            onClick={() => requestSwitch(item.id)}
          >
            <span>{item.avatar}</span>
            {item.name}
          </button>
        ))}
      </section>

      <section className="kid-passport" data-testid="kid-passport">
        <div className="passport-face">
          <span className="passport-sticker" aria-hidden="true">
            {sticker?.emoji ?? "🎹"}
          </span>
          <span className="passport-avatar">{kid?.avatar ?? "🎵"}</span>
          {badge ? <span className="passport-badge">{badge.emoji}</span> : null}
        </div>
        <div className="passport-copy">
          <p className="eyebrow">Kid profile</p>
          <h1>{kid?.name ?? "Friend"}</h1>
          <p className="level-line" data-testid="level-line">
            Level {bar.level}
            {kid?.streakDays ? ` · ${kid.streakDays}-day streak` : ""}
          </p>
          <div className="xp-bar" data-testid="xp-bar" aria-label={`${bar.current} of ${bar.needed} XP`}>
            <span style={{ width: `${Math.min(100, (bar.current / bar.needed) * 100)}%` }} />
          </div>
          <p className="muted">{bar.current} / {bar.needed} XP toward the next level</p>
        </div>
      </section>

      <section className="lesson-card continue-card" data-testid="lesson-card">
        <p className="eyebrow">Ready when you are</p>
        <h1>{nextUnit.title}</h1>
        <p>{nextUnit.blurb}</p>
        <button
          type="button"
          className="btn primary xl"
          data-testid="start-lesson"
          disabled={!kid}
          onClick={() => startUnit(nextUnit.id)}
        >
          {stars[nextUnit.id] ? `Play ${nextUnit.title} again` : `Start ${nextUnit.title}`}
        </button>
      </section>

      <section className="course-path" data-testid="course-path">
        <h2>Course path</h2>
        <p className="muted">Finish a stage to open the next. A grown-up can unlock the whole path in settings.</p>
        <ol>
          {COURSE_UNITS.map((unit, index) => {
            const open = isUnitUnlocked(unit.id, UNIT_ORDER, stars, persist.pathUnlocked);
            const earned = stars[unit.id] ?? 0;
            return (
              <li
                key={unit.id}
                className={open ? "path-step open" : "path-step locked"}
                data-testid={`path-${unit.id}`}
              >
                <div className="path-node">{index + 1}</div>
                <div className="path-copy">
                  <h3>{unit.title}</h3>
                  <p>{unit.subtitle}</p>
                  <p className="star-row tiny" aria-label={earned ? `${earned} stars` : "Not finished"}>
                    {[1, 2, 3].map((slot) => (
                      <span key={slot} className={slot <= earned ? "lit" : ""}>
                        ★
                      </span>
                    ))}
                  </p>
                  <button
                    type="button"
                    className="btn ghost"
                    disabled={!kid || !open}
                    data-testid={`start-${unit.id}`}
                    onClick={() => startUnit(unit.id)}
                  >
                    {open ? (earned ? "Play again" : "Start") : "Locked"}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="reward-shelf" data-testid="reward-shelf">
        <h2>Stickers and colors</h2>
        <p className="muted">
          Practice unlocks looks only. There is nothing to buy, and practice is never paused for energy.
        </p>
        <div className="reward-grid">
          <button
            type="button"
            className={kid?.theme === "cream" ? "reward-tile selected" : "reward-tile"}
            onClick={() => kid && updateKid(kid.id, { theme: "cream" })}
          >
            <span>🕯️</span>
            Warm Cream
          </button>
          {REWARDS.map((reward) => {
            const unlocked = kid?.unlockedRewards.includes(reward.id);
            return (
              <button
                key={reward.id}
                type="button"
                className={tileClass(reward, kid?.theme, kid?.sticker, kid?.badge, Boolean(unlocked))}
                disabled={!kid || !unlocked}
                data-testid={`reward-${reward.id}`}
                onClick={() => kid && equipReward(kid.id, reward, updateKid)}
              >
                <span>{reward.emoji}</span>
                {reward.name}
                <small>{unlocked ? reward.kind : `Level ${reward.level}`}</small>
              </button>
            );
          })}
        </div>
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
            const result = await checkPin(pin);
            if (result.ok) {
              setGate(null);
              setScreen("settings");
            }
            return result;
          }}
        />
      ) : null}

      {gate && typeof gate === "object" ? (
        <PinPad
          title="Switch profiles?"
          subtitle="A grown-up PIN is needed to change who is practicing."
          submitLabel="Switch"
          onCancel={() => setGate(null)}
          onSubmit={async (pin) => {
            const result = await checkPin(pin);
            if (result.ok) {
              setActiveKid(gate.switchTo);
              setGate(null);
            }
            return result;
          }}
        />
      ) : null}
    </main>
  );
}

function tileClass(
  reward: Reward,
  theme: string | undefined,
  sticker: string | null | undefined,
  badge: string | null | undefined,
  unlocked: boolean,
): string {
  const equipped =
    (reward.kind === "theme" && reward.theme === theme) ||
    (reward.kind === "sticker" && reward.id === sticker) ||
    (reward.kind === "badge" && reward.id === badge);
  return `reward-tile${unlocked ? "" : " locked"}${equipped ? " selected" : ""}`;
}

function equipReward(
  kidId: string,
  reward: Reward,
  updateKid: (id: string, patch: { theme?: Reward["theme"]; sticker?: string | null; badge?: string | null }) => void,
) {
  if (reward.kind === "theme" && reward.theme) updateKid(kidId, { theme: reward.theme });
  if (reward.kind === "sticker") updateKid(kidId, { sticker: reward.id });
  if (reward.kind === "badge") updateKid(kidId, { badge: reward.id });
}
