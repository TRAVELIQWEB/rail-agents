import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { isSameOriginRequest } from "@/lib/same-origin";
import {
  assertGlobalVariableKey,
  globalVariableRegistry,
  validateGlobalVariableInput,
} from "@/lib/global-variable-registry";
import { getGlobalVariableRecords, upsertGlobalVariable } from "@/lib/global-variables";
import { GlobalVariableKey, type GlobalVariableDocument } from "@/models/global-variable.schema";

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

function serializeVariable(key: GlobalVariableKey, record?: GlobalVariableDocument, records: GlobalVariableDocument[] = []) {
  const definition = globalVariableRegistry[key];
  const { allowEmpty, maxLength, message } = definition.validation;
  return {
    key,
    label: definition.label,
    description: definition.description,
    inputType: definition.inputType,
    statusControlledBy: definition.statusControlledBy ?? null,
    // Validation functions remain server-only; expose only serializable metadata.
    validation: { allowEmpty, maxLength, message: message ?? null },
    value: record?.value ?? null,
    desc: record?.desc ?? definition.description,
    status: record ? (definition.statusControlledBy ? records.find((item) => item.key === definition.statusControlledBy)?.status === true : record.status) : null,
    configured: record !== undefined,
    createdAt: record?.createdAt ?? null,
    updatedAt: record?.updatedAt ?? null,
  };
}

export async function GET() {
  try {
    if (!(await getAdminSession())) return jsonResponse({ error: "Unauthorized" }, 401);

    const records = await getGlobalVariableRecords();
    const byKey = new Map(records.map((record) => [record.key, record]));
    const variables = Object.values(GlobalVariableKey).map((key) => serializeVariable(key, byKey.get(key), records));
    return jsonResponse({ success: true, variables });
  } catch (error) {
    console.error("Global variables GET failed:", error);
    return jsonResponse({ error: "Unable to load global variables." }, 500);
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await getAdminSession())) return jsonResponse({ error: "Unauthorized" }, 401);

    if (!isSameOriginRequest(request)) return jsonResponse({ error: "Invalid request origin" }, 403);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body." }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({ error: "Expected a global variable object." }, 400);
    }

    const payload = body as Record<string, unknown>;
    if (Object.keys(payload).some((field) => !["key", "value", "desc", "status"].includes(field))) {
      return jsonResponse({ error: "Only key, value, desc and status may be provided." }, 400);
    }
    const { key, value, desc, status } = payload;
    if (typeof value !== "string" || typeof desc !== "string" || typeof status !== "boolean") {
      return jsonResponse({ error: "value and desc must be strings; status must be a boolean." }, 400);
    }
    try {
      assertGlobalVariableKey(key);
    } catch {
      return jsonResponse({ error: "Unknown global variable key." }, 400);
    }
    try {
      validateGlobalVariableInput(key, value, desc, status);
    } catch (error) {
      return jsonResponse({ error: error instanceof Error ? error.message : "Invalid global variable value." }, 400);
    }

    const record = await upsertGlobalVariable(key, value, desc, status);
    const records = await getGlobalVariableRecords();
    const byKey = new Map(records.map((item) => [item.key, item]));
    return jsonResponse({
      success: true,
      message: "Global variable saved successfully.",
      variable: serializeVariable(key, record, records),
      variables: Object.values(GlobalVariableKey).map((item) => serializeVariable(item, byKey.get(item), records)),
    });
  } catch (error) {
    console.error("Global variables PUT failed:", error);
    return jsonResponse({ error: "Unable to save global variable." }, 500);
  }
}
