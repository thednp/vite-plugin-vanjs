/**
 * Once initial hydration completes, freshly rendered client nodes are born
 * into live DOM that is never diffed again, so they need no hydration keys.
 * Server bundles get their own module instance where this stays false.
 */
let hydrationComplete = false;

/** @type {() => void} */
export function markHydrationComplete() {
  hydrationComplete = true;
}

/** @type {() => void} */
export function resetHydrationState() {
  hydrationComplete = false;
}

/** @type {(props: Record<string, unknown>) => boolean} */
export function needsHydration(props) {
  if (hydrationComplete) return false;
  return props && (
    Object.keys(props).some((k) => k.startsWith("on")) || // has events
    Object.entries(props).some(([k, v]) =>
      v && typeof v === "object" && (
        "val" in v || k === "style" && Object.values(v).some((sv) =>
            sv && typeof sv === "object" && "val" in sv
          )
      )
    ) // has state
  );
}
