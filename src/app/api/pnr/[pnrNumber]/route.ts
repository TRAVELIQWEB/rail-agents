import { NextRequest, NextResponse } from "next/server";
import { fetchPnrFromProvider } from "@/lib/pnr";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ pnrNumber: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { pnrNumber } = await params;
  if (!/^\d{10}$/.test(pnrNumber)) {
    return NextResponse.json({ error: "Enter a valid 10-digit PNR number." }, { status: 400 });
  }

  try {
    const data = await fetchPnrFromProvider(pnrNumber);
    return NextResponse.json(
      { success: true, data },
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
