import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { syncStationsToDatabase } from "@/lib/stations";

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
 * POST /api/admin/stations/sync
 * Secure admin endpoint to fetch all stations from the external provider
 * and bulk upsert them into the MongoDB 'stations' collection.
 */
export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return jsonResponse({ error: "Unauthorized. Admin session required." }, 401);
  }

  try {
    const stats = await syncStationsToDatabase();

    return jsonResponse({
      success: true,
      message: "Railway stations synchronized to MongoDB successfully.",
      stats,
    });
  } catch (error: unknown) {
    console.error("Stations sync failed:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return jsonResponse({ error: message }, 500);
  }
}

