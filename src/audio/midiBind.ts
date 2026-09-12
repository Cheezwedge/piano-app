/** Bind each item once so reconnect storms do not stack listeners. */
export function bindUnique<T>(seen: WeakSet<object>, items: Iterable<T>, bind: (item: T) => void): number {
  let added = 0;
  for (const item of items) {
    if (typeof item !== "object" || item == null) continue;
    if (seen.has(item as object)) continue;
    seen.add(item as object);
    bind(item);
    added += 1;
  }
  return added;
}
