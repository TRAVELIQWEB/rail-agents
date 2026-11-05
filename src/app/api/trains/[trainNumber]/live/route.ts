import { after, NextRequest, NextResponse } from "next/server";
import { fetchLiveTrainStatus } from "@/lib/live-train";
import { readRailwaySnapshot, saveRailwaySnapshot } from "@/lib/railway-snapshots";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ trainNumber: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { trainNumber } = await params;
  const date = request.nextUrl.searchParams.get("date") || "";

  if (!/^\d{3,6}$/.test(trainNumber)) {
    return NextResponse.json({ error: "A valid train number is required." }, { status: 400 });
  }
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    return NextResponse.json({ error: "Provide a valid journey date in YYYY-MM-DD format." }, { status: 400 });
  }

  const snapshotId = `${trainNumber}:${date}`;
  if (request.nextUrl.searchParams.get("refresh") !== "1") {
    try {
      const cached = await readRailwaySnapshot("live", snapshotId);
      if (cached !== null) {
        return NextResponse.json(
          { success: true, source: "mongodb", data: cached },
          { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
        );
      }
    } catch (error) {
      console.error("Live train snapshot lookup failed; checking the railway provider:", error);
    }
  }

  try {
    const data = await fetchLiveTrainStatus(trainNumber, date);
    after(async () => {
      try {
        await saveRailwaySnapshot("live", snapshotId, data);
      } catch (error) {
        console.error("Could not save live train snapshot:", error);
      }
    });
    return NextResponse.json(
      { success: true, source: "railway-provider", data },
      { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to retrieve live train status right now.";
    const status = message.includes("not configured") ? 503 : message.includes("not found") ? 404 : 502;
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  }
}
