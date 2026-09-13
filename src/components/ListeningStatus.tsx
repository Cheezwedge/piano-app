import { listenLabel, type ListenChannel } from "../audio/listenStatus";

interface Props {
  mic: ListenChannel;
  midi: ListenChannel;
  onRetryMic?: () => void;
}

export function ListeningStatus({ mic, midi, onRetryMic }: Props) {
  const micBlocked = mic.status === "error";

  return (
    <div className="listen-block" data-testid="input-status">
      <div className="listen-row">
        <ListenPill kind="Mic" channel={mic} />
        <ListenPill kind="MIDI" channel={midi} />
      </div>
      {micBlocked ? (
        <div className="mic-retry" data-testid="mic-retry">
          <p>The microphone is blocked. Home Keys can still use MIDI or the on-screen keys.</p>
          {onRetryMic ? (
            <button type="button" className="btn ghost" data-testid="mic-retry-btn" onClick={onRetryMic}>
              Allow microphone
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ListenPill({ kind, channel }: { kind: string; channel: ListenChannel }) {
  return (
    <span className={`listen-pill is-${channel.status}`} data-testid={`listen-${kind.toLowerCase()}`}>
      <span className="listen-dot" aria-hidden="true" />
      <strong>{kind}</strong>
      <span>{listenLabel(channel)}</span>
    </span>
  );
}
