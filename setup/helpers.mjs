/** @type {(props: Record<string, unknown>) => boolean} */
export function needsHydration(props) {
  return props && (
    Object.keys(props).some((k) => k.startsWith("on")) || // has events
    Object.values(props).some((v) => v && typeof v === "object" && "val" in v) // has state
  );
}
