export type ListenStatus = "off" | "starting" | "calibrating" | "listening" | "detected" | "error";

export interface ListenChannel {
  status: ListenStatus;
  detail?: string;
}

export const LISTEN_OFF: ListenChannel = { status: "off" };

export function listenLabel(channel: ListenChannel): string {
  switch (channel.status) {
    case "off":
      return "Off";
    case "starting":
      return "Starting…";
    case "calibrating":
      return "Calibrating…";
    case "listening":
      return channel.detail ? `Listening · ${channel.detail}` : "Listening";
    case "detected":
      return channel.detail ? `Heard ${channel.detail}` : "Note detected";
    case "error":
      return channel.detail ?? "Error";
    default:
      return "Off";
  }
}
