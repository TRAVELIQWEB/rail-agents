import { after, NextRequest, NextResponse } from "next/server";
import { searchStationsFromDatabase, searchStationsFromProvider, getStationsCount, populateStationsIfEmpty, saveStationsToDatabase } from "@/lib/stations";

export const runtime = "nodejs";

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * GET /api/stations
 * Searches MongoDB first, then returns provider results while saving missing data.
 * Query parameters:
 *  - `q`: Search string (station code or station name)
 *  - `limit`: Maximum matching results (default: 10, max: 10)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const limit = 10;
  let totalInDb: number | null = null;

  try {
    totalInDb = await getStationsCount();
    const stations = totalInDb > 0 ? await searchStationsFromDatabase(query, limit) : [];
    if (stations.length > 0) {
      return jsonResponse({ success: true, source: "mongodb", totalInDb, count: stations.length, stations });
    }
  } catch (error: unknown) {
    console.error("Database station search failed; checking the railway provider:", error);
  }

  try {
    const stations = await searchStationsFromProvider(query, limit);
    const databaseWasEmpty = totalInDb === 0;
    after(async () => {
      try {
        if (databaseWasEmpty) {
          await populateStationsIfEmpty();
        } else {
          await saveStationsToDatabase(stations);
        }
      } catch (error) {
        console.error("Could not save railway provider stations to MongoDB:", error);
      }
    });
    return jsonResponse({ success: true, source: "railway-provider", totalInDb, count: stations.length, stations });
  } catch (providerError) {
    console.error("Railway station provider fallback failed:", providerError);
    return jsonResponse({ success: false, error: "Station search is temporarily unavailable. Please try again." }, 503);
  }
}
