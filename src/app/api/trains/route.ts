import { NextRequest, NextResponse } from "next/server";
import { searchTrainsFromDatabase } from "@/lib/trains";

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
 * GET /api/trains
 * Searches trains by trainNumber or trainName from MongoDB (with auto-sync & provider fallback).
 * Query parameters:
 *  - `q`: Search string (train number or train name)
 *  - `limit`: Maximum matching results (default: 10, max: 15)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const rawLimit = Number(searchParams.get("limit") || "10");
    const limit = Math.min(Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 10), 15);

    const { trains, totalInDb, source } = await searchTrainsFromDatabase(query, limit);

    return jsonResponse({
      success: true,
      source,
      totalInDb,
      count: trains.length,
      trains,
    });
  } catch (error: unknown) {
    console.error("Train search failed:", error);
    return jsonResponse(
      { error: "Unable to retrieve train list." },
      500
    );
  }
}

