import { after, NextRequest, NextResponse } from "next/server";
import { fetchPnrFromProvider } from "@/lib/pnr";
import { readRailwaySnapshot, saveRailwaySnapshot } from "@/lib/railway-snapshots";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ pnrNumber: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { pnrNumber } = await params;
  if (!/^\d{10}$/.test(pnrNumber)) {
    return NextResponse.json({ error: "Enter a valid 10-digit PNR number." }, { status: 400 });
  }

  if (request.nextUrl.searchParams.get("refresh") !== "1") {
    try {
      const cached = await readRailwaySnapshot("pnr", pnrNumber);
      if (cached !== null) {
        return NextResponse.json(
          { success: true, source: "mongodb", data: cached },
          { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
        );
      }
    } catch (error) {
      console.error("PNR snapshot lookup failed; checking the railway provider:", error);
    }
  }

  try {
    const data = await fetchPnrFromProvider(pnrNumber);
    after(async () => {
      try {
        await saveRailwaySnapshot("pnr", pnrNumber, data);
      } catch (error) {
        console.error("Could not save PNR snapshot:", error);
      }
    });
    return NextResponse.json(
      { success: true, source: "railway-provider", data },
      { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to retrieve PNR status right now.";
    const status = message.includes("not configured") ? 503 : message.includes("not found") ? 404 : 502;
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  }
}
