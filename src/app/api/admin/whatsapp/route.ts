
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { isSameOriginRequest } from "@/lib/same-origin";
import { getWhatsAppSettingsForAdmin } from "@/lib/whatsapp-settings";
import { saveWhatsAppSettings } from "@/lib/global-variables";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// GET: Read WhatsApp settings
export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const whatsapp = await getWhatsAppSettingsForAdmin();

    return jsonResponse({ success: true, whatsapp });
  } catch (error) {
    console.error("WhatsApp GET error:", error);
    return jsonResponse(
      { error: "Failed to load WhatsApp settings" },
      500
    );
  }
}

// PUT: Update WhatsApp settings
export async function PUT(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  try {
    if (!isSameOriginRequest(request)) {
      return jsonResponse({ error: "Invalid request origin" }, 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({ error: "Invalid settings body" }, 400);
    }
    const { number, message, enabled } = body as Record<string, unknown>;

    if (
      typeof number !== "string" ||
      !/^[1-9]\d{7,14}$/.test(number)
    ) {
      return jsonResponse(
        { error: "Invalid WhatsApp number" },
        400
      );
    }

    if (
      typeof message !== "string" ||
      message.length > 1000
    ) {
      return jsonResponse(
        { error: "Invalid WhatsApp message" },
        400
      );
    }

    if (typeof enabled !== "boolean") {
      return jsonResponse(
        { error: "Invalid enabled status" },
        400
      );
    }

    await saveWhatsAppSettings({ number, message, enabled });

    return jsonResponse({
      success: true,
      message: "WhatsApp settings updated successfully",
    });
  } catch (error) {
    console.error("WhatsApp PUT error:", error);

    return jsonResponse(
      { error: "Failed to update WhatsApp settings" },
      500
    );
  }
}
