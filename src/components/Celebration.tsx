import type { StageAward } from "../lib/progress";
import { REWARDS } from "../lib/rewards";

interface Props {
  award: StageAward;
  unitTitle: string;
  kidName: string;
  onDone: () => void;
  doneLabel?: string;
}

export function Celebration({ award, unitTitle, kidName, onDone, doneLabel = "Back to the path" }: Props) {
  const fresh = REWARDS.filter((reward) => award.newRewards.includes(reward.id));

  return (
    <main className="page lesson done celebration" data-testid="lesson-complete">
      <div className="celebrate-card" data-testid="celebration">
        <p className="eyebrow">Stage complete</p>
        <h1>{kidName}, you finished {unitTitle}.</h1>
        <p className="star-row" aria-label={`${award.stars} stars`} data-testid="award-stars">
          {[1, 2, 3].map((slot) => (
            <span key={slot} className={slot <= award.stars ? "lit" : ""}>
              ★
            </span>
          ))}
        </p>
        <p>
          {award.xpGained > 0 ? `+${award.xpGained} XP` : "Best stars already saved."}
          {award.leveledUp ? " · Level up!" : ""}
        </p>
        {fresh.length ? (
          <p className="reward-unlocks" data-testid="new-rewards">
            New sticker or color: {fresh.map((item) => `${item.emoji} ${item.name}`).join(" · ")}
          </p>
        ) : null}
        <p className="muted">These are just looks — practice is never locked behind a timer or a shop.</p>
        <button type="button" className="btn primary xl" onClick={onDone}>
          {doneLabel}
        </button>
      </div>
    </main>
  );
}
