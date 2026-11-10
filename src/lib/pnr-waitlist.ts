const waitlistNames: Record<string, string> = {
  WL: "Waiting List",
  GNWL: "General Waiting List",
  RLWL: "Remote Location Waiting List",
  PQWL: "Pooled Quota Waiting List",
  RQWL: "Request Waiting List",
  TQWL: "Tatkal Waiting List",
  CKWL: "Tatkal Waiting List",
  DPWL: "Duty Pass Waiting List",
  RSWL: "Roadside Waiting List",
};

export function waitingListDetails(status: string) {
  const match = /^([A-Z]*WL)(?:[\s/:-]+(\d+))?(?=$|[\s/:-])/i.exec(status.trim());
  if (!match) return null;
  const code = match[1].toUpperCase();
  const position = match[2] ? Number(match[2]) : null;
  return { code, position, name: waitlistNames[code] ?? "Waiting List" };
}

export function isWaitingListStatus(status: string): boolean {
  return waitingListDetails(status) !== null || /\bWL\b|waitlist|waiting/i.test(status);
}
