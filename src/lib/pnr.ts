import "server-only";

const DEFAULT_PNR_API_URL = "https://dev-api-rail.977-24-24-365.co.in/rail/integrations/pnr";

export async function fetchPnrFromProvider(pnrNumber: string): Promise<unknown> {
  const baseUrl = (process.env.RAILWAY_PNR_API_URL || DEFAULT_PNR_API_URL).replace(/\/+$/, "");
  const apiKey = process.env.RAILWAY_API_KEY;

  if (!apiKey) {
    throw new Error("PNR lookup is not configured. Set the railway API key on the server.");
  }

  const response = await fetch(`${baseUrl}/${encodeURIComponent(pnrNumber)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-api-key": apiKey,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
        ? body.message
        : response.status === 404
          ? "No PNR record was found. Check the number and try again."
          : `PNR provider returned status ${response.status}. Please try again shortly.`;
    throw new Error(message);
  }

  if (typeof body !== "object" || body === null) {
    throw new Error("The PNR provider returned an unexpected response.");
  }

  if ("success" in body && body.success === false) {
    const message = "message" in body && typeof body.message === "string"
      ? body.message
      : "The PNR provider could not retrieve this booking.";
    throw new Error(message);
  }

  return body;
}
