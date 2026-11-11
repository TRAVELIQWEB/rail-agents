/** A missing delay must never be treated as an on-time report. */
export function reportedDelayMinutes(value: unknown, actual?: unknown, scheduled?: unknown): number | null {
  if ((typeof value === "number" || typeof value === "string") && String(value).trim() !== "") {
    const minutes = Number(value);
    if (Number.isFinite(minutes)) return minutes;
  }
  // Full timestamps carry the journey day, so overnight delays remain accurate.
  if (typeof actual === "string" && typeof scheduled === "string"
    && /^\d{4}-\d{2}-\d{2}T/.test(actual) && /^\d{4}-\d{2}-\d{2}T/.test(scheduled)) {
    const difference = Date.parse(actual) - Date.parse(scheduled);
    if (Number.isFinite(difference)) return Math.round(difference / 60_000);
  }
  return null;
}

export function isEstimatedTracking(record: Record<string, unknown> | null): boolean {
  if (!record) return false;
  // A historical/offline feed can still contain observed events.
  // Only explicit prediction provenance makes a feed estimated.
  return /simulated|predicted|estimated|synthetic|forecast/i.test(
    [record.trackingMode, record.provenance, record.timingProvenance, record.dataProvenance].filter((value) => typeof value === "string").join(" "),
  );
}

/** Only a provider-marked live position can receive the live running indicator. */
export function hasReportedLivePosition(record: Record<string, unknown> | null, running: boolean): boolean {
  if (!record || !running || record.isLive !== true || isEstimatedTracking(record)) return false;
  const location = record.currentLocation ?? record.currentPosition;
  if (!location || typeof location !== "object" || Array.isArray(location)) return false;
  const position = location as Record<string, unknown>;
  if (/predicted|estimated|simulated|synthetic|forecast/i.test(String(position.provenance ?? position.trackingMode ?? ""))) return false;
  const code = position.stationCode ?? position.code;
  return typeof code === "string" && /^[A-Za-z0-9]{1,10}$/.test(code);
}
