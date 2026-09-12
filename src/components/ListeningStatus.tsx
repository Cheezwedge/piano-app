import { listenLabel, type ListenChannel } from "../audio/listenStatus";

interface Props {
  mic: ListenChannel;
  midi: ListenChannel;
}

export function ListeningStatus({ mic, midi }: Props) {
  return (
    <div className="listen-row" data-testid="input-status">
      <ListenPill kind="Mic" channel={mic} />
      <ListenPill kind="MIDI" channel={midi} />
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
