import { NextRequest, NextResponse } from "next/server";
import { fetchLiveTrainStatus } from "@/lib/live-train";

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

  try {
    const data = await fetchLiveTrainStatus(trainNumber, date);
    return NextResponse.json(
      { success: true, data },
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
