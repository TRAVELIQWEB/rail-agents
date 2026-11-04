import { NextRequest, NextResponse } from "next/server";
import { searchStationsFromDatabase, getStationsCount } from "@/lib/stations";

export const runtime = "nodejs";

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * GET /api/stations
 * Searches stations directly from the permanent MongoDB collection.
 * Query parameters:
 *  - `q`: Search string (station code or station name)
 *  - `limit`: Maximum matching results (default: 10, max: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = 10; // Max 10 matching results per request

    const [stations, totalInDb] = await Promise.all([
      searchStationsFromDatabase(query, limit),
      getStationsCount(),
    ]);

    return jsonResponse({
      success: true,
      source: "mongodb",
      totalInDb,
      count: stations.length,
      stations,
    });
  } catch (error: unknown) {
    console.error("MongoDB station search failed:", error);
    return jsonResponse(
      { error: "Unable to retrieve stations from database." },
      500
    );
  }
}
