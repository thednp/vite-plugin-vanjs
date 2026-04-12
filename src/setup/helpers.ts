export function needsHydration(props: Record<string, unknown>): boolean {
  return props && (
    Object.keys(props).some((k) => k.startsWith("on")) ||
    Object.values(props).some((v) => v && typeof v === "object" && "val" in v)
  );
}
