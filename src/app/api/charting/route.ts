import { NextRequest, NextResponse } from "next/server";
import { fetchTrainChartingFromExternalProvider } from "@/lib/trains";

export const runtime = "nodejs";

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * GET /api/charting?trainNumber=12952&date=2026-11-03
 * Fetches station-wise reservation chart preparation timings for a given train and date.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawTrain = (searchParams.get("trainNumber") || searchParams.get("train") || "").trim();
    const rawDate = (searchParams.get("date") || "").trim();

    // Extract 4-5 digit train number if formatted string was passed
    const trainMatch = rawTrain.match(/\b(\d{3,6})\b/);
    const trainNumber = trainMatch ? trainMatch[1] : rawTrain;

    if (!trainNumber || !/^\d{3,6}$/.test(trainNumber)) {
      return jsonResponse(
        { error: "Please provide a valid train number (e.g. 12952)." },
        400
      );
    }

    if (!rawDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      return jsonResponse(
        { error: "Please provide a valid journey date in YYYY-MM-DD format." },
        400
      );
    }

    const chartingData = await fetchTrainChartingFromExternalProvider(trainNumber, rawDate);

    return jsonResponse({
      success: true,
      data: chartingData,
    });
  } catch (error: unknown) {
    console.error("Train charting API failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unable to fetch chart preparation timings right now.";
    return jsonResponse({ error: message }, 502);
  }
}

