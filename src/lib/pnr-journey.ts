export function pnrJourneyNotice(date: string, departure: string, now = Date.now()): "scheduled" | "past-date" | null {
  const day = date.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (!day || !Number.isFinite(Date.parse(`${day}T00:00:00Z`))
    || new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day) return null;
  const time = departure.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (time) {
    let hour = Number(time[1]);
    const minute = Number(time[2]);
    const second = Number(time[3] ?? 0);
    if (minute <= 59 && second <= 59 && (time[4] ? hour >= 1 && hour <= 12 : hour <= 23)) {
      if (time[4]) hour = hour % 12 + (time[4].toUpperCase() === "PM" ? 12 : 0);
      const scheduled = Date.parse(`${day}T${String(hour).padStart(2, "0")}:${time[2]}:${String(second).padStart(2, "0")}+05:30`);
      if (scheduled <= now) return "scheduled";
      return null;
    }
  }
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (name: string) => parts.find(p => p.type === name)?.value;
  const today = `${part("year")}-${part("month")}-${part("day")}`;
  return day < today ? "past-date" : null;
}
