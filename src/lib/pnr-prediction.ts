import "server-only";

const DEFAULT_PNR_PREDICTION_URL = "https://dev-api-rail.977-24-24-365.co.in/rail/integrations/pnr/:pnrNumber/prediction";

export async function fetchPnrPrediction(pnrNumber: string): Promise<unknown> {
  const apiKey = process.env.RAILWAY_API_KEY;
  if (!apiKey) throw new Error("PNR prediction is not configured on the server.");

  const configuredUrl = process.env.RAILWAY_PNR_PREDICTION_API_URL || DEFAULT_PNR_PREDICTION_URL;
  const endpointUrl = configuredUrl.includes(":pnrNumber")
    ? configuredUrl.replace(":pnrNumber", encodeURIComponent(pnrNumber))
    : `${configuredUrl.replace(/\/+$/, "")}/${encodeURIComponent(pnrNumber)}/prediction`;

  const response = await fetch(endpointUrl, {
    method: "GET",
    headers: { Accept: "application/json", "x-api-key": apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const providerMessage = typeof body === "object" && body !== null
      ? "message" in body && typeof body.message === "string"
        ? body.message
        : "error" in body && typeof body.error === "string"
          ? body.error
          : null
      : null;
    throw new Error(providerMessage || `PNR prediction provider returned status ${response.status}.`);
  }
  if (typeof body !== "object" || body === null) {
    throw new Error("The PNR prediction provider returned an unexpected response.");
  }
  if ("success" in body && body.success === false) {
    throw new Error("message" in body && typeof body.message === "string"
      ? body.message
      : "The provider could not generate a prediction for this PNR.");
  }
  return body;
}
