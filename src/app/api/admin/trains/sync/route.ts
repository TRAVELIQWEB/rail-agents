import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { syncTrainsToDatabase } from "@/lib/trains";

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
 * POST /api/admin/trains/sync
 * Secure admin endpoint to fetch all trains from the external provider
 * and bulk upsert them into the MongoDB 'trains' collection.
 */
export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return jsonResponse({ error: "Unauthorized. Admin session required." }, 401);
  }

  try {
    const stats = await syncTrainsToDatabase();

    return jsonResponse({
      success: true,
      message: "Railway train list synchronized to MongoDB successfully.",
      stats,
    });
  } catch (error: unknown) {
    console.error("Trains sync failed:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return jsonResponse({ error: message }, 500);
  }
}

