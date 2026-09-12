export function sessionExpired(
  startedAt: number | null,
  limitMinutes: number,
  now: number,
): boolean {
  if (startedAt == null || limitMinutes <= 0) return false;
  return now - startedAt >= limitMinutes * 60 * 1000;
}
