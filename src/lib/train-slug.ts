/**
 * Utilities for SEO-friendly train URLs matching the pattern:
 * e.g. /chart-times/12952-mmct-tejas-raj-chart-times?date=2026-11-11
 * e.g. /live-train-status/12952-mmct-tejas-raj?date=2026-11-11
 */

export function slugifyTrainName(trainName?: string | null): string {
  if (!trainName) return "";
  return trainName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createTrainSlug(
  trainNumber: string,
  trainName?: string | null,
  suffix?: string | null
): string {
  const cleanNumber = trainNumber.trim().replace(/\D/g, "");
  const cleanName = slugifyTrainName(trainName);

  let slug = cleanNumber;
  if (cleanName) {
    slug = `${cleanNumber}-${cleanName}`;
  }
  if (suffix) {
    const cleanSuffix = slugifyTrainName(suffix);
    if (cleanSuffix && !slug.endsWith(cleanSuffix)) {
      slug = `${slug}-${cleanSuffix}`;
    }
  }

  return slug;
}

export function parseTrainSlug(slug?: string | null): {
  trainNumber: string;
  trainName: string;
} {
  if (!slug) return { trainNumber: "", trainName: "" };

  const decoded = decodeURIComponent(slug).trim();
  const match = decoded.match(/^(\d{4,5})(?:-(.+))?$/);

  if (match) {
    const trainNumber = match[1];
    let rawName = match[2] || "";
    // Strip optional suffixes like "-chart-times", "-running-status", "-live-status"
    rawName = rawName
      .replace(/-chart-times$/i, "")
      .replace(/-running-status$/i, "")
      .replace(/-live-status$/i, "")
      .replace(/-/g, " ")
      .trim();

    return {
      trainNumber,
      trainName: rawName.toUpperCase(),
    };
  }

  // Fallback: extract any digits
  const fallbackDigits = decoded.replace(/\D/g, "").slice(0, 5);
  return {
    trainNumber: fallbackDigits,
    trainName: "",
  };
}

export function todayInIndia(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (part: string) => parts.find((item) => item.type === part)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}
