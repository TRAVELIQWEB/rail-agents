import "server-only";

const DEFAULT_LIVE_TRAIN_URL = "https://dev-api-rail.977-24-24-365.co.in/rail/integrations/trains/:trainNumber/live";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export async function fetchLiveTrainStatus(trainNumber: string, date: string): Promise<unknown> {
  const apiKey = process.env.RAILWAY_API_KEY;
  if (!apiKey) throw new Error("Live train status is not configured on the server.");

  const configuredUrl = process.env.RAILWAY_LIVE_TRAIN_API_URL || DEFAULT_LIVE_TRAIN_URL;
  const endpointUrl = configuredUrl.includes(":trainNumber")
    ? configuredUrl.replace(":trainNumber", encodeURIComponent(trainNumber))
    : `${configuredUrl.replace(/\/+$/, "")}/${encodeURIComponent(trainNumber)}/live`;
  const url = new URL(endpointUrl);
  url.searchParams.set("date", date);
  url.searchParams.set("geometry", "true");
  url.searchParams.set("format", "polyline");
  url.searchParams.set("includeCoordinates", "true");

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", "x-api-key": apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const providerError = typeof body === "object" && body !== null
      ? "message" in body && typeof body.message === "string"
        ? body.message
        : "error" in body && typeof body.error === "string"
          ? body.error
          : null
      : null;
    throw new Error(providerError || (response.status === 404
      ? "Live train status was not found for this train and date."
      : `Live train provider returned status ${response.status}.`));
  }
  if (typeof body !== "object" || body === null) {
    throw new Error("The live train provider returned an unexpected response.");
  }
  if ("success" in body && body.success === false) {
    throw new Error("The live train provider could not retrieve this train right now.");
  }

  const outer = asRecord(body);
  const journey = asRecord(outer?.data) ?? asRecord(outer?.result) ?? outer;
  const reportedDate = journey?.startDate ?? journey?.journeyDate ?? journey?.date;
  if (typeof reportedDate !== "string" || reportedDate.slice(0, 10) !== date) {
    throw new Error("The railway provider did not return data for the selected journey date. Please try again later.");
  }
  const reportedTrainNumber = journey?.trainNumber;
  if (reportedTrainNumber !== undefined && String(reportedTrainNumber) !== trainNumber) {
    throw new Error("The railway provider returned a different train. Please try again later.");
  }
  return body;
}
