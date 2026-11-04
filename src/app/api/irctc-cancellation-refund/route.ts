import { NextResponse } from "next/server";
import {
  calculateIRCTCRefund,
  type IRCTCBookingSource,
  type IRCTCFareInputMode,
  type IRCTCPaymentMethod,
  type IRCTCRefundInput,
  type IRCTCTravelClass,
  type IRCTCTicketStatus,
} from "@/lib/server/irctc-refund-calculator";
import {
  createIRCTCTimingFromHours,
  getCurrentLocalDateTime,
  resolveIRCTCTiming,
  type IRCTCQuickTimeBandId,
  type IRCTCRuleRegime,
} from "@/lib/server/irctc-refund-request";
import {
  calculateIRCTCWorkflow,
  getIRCTCCalculatorMetadata,
  normalizeIRCTCFormState,
  resolveIRCTCScenario,
} from "@/lib/server/irctc-refund-workflow";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_AMOUNT = 10_000_000;
const MAX_HOURS_BEFORE_DEPARTURE = 24 * 366;

const bookingSources = ["PERSONAL", "AGENT", "COUNTER"] as const;
const paymentMethods = ["CARD", "UPI"] as const;
const fareInputModes = ["GRAND_TOTAL", "PURE_FARE"] as const;
const travelClasses = ["1AC", "2AC", "3AC", "SL", "2S"] as const;
const ticketStatuses = [
  "CNF",
  "RAC",
  "WL",
  "TQ_CNF",
  "TQWL",
  "TRAIN_CANCELLED",
] as const;
const ruleRegimes = ["ACTUAL_48H", "VB_SLEEPER_72H"] as const;
const cateringLastEditedValues = ["TOTAL", "PER_PAX"] as const;

type InputValidation =
  | { ok: true; input: IRCTCRefundInput }
  | { ok: false; errors: string[] };

function isOneOf<T extends string>(
  value: unknown,
  values: readonly T[],
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonResponse(
  body: unknown,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function exactKeys(
  body: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  return (
    Object.keys(body).length === keys.length &&
    keys.every((key) => Object.prototype.hasOwnProperty.call(body, key))
  );
}

async function readLimitedBody(request: Request): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_REQUEST_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function workflowResponse(result: ReturnType<typeof calculateIRCTCWorkflow>) {
  if (!result.ok) {
    return jsonResponse(
      { error: "Invalid calculator input.", fieldErrors: result.errors },
      400,
    );
  }
  return jsonResponse(result.response);
}

function validateInput(body: unknown): InputValidation {
  if (!isRecord(body)) {
    return { ok: false, errors: ["Request body must be a JSON object."] };
  }

  const errors: string[] = [];
  const requiredFields = [
    "ruleRegime",
    "bookingSource",
    "paymentMethod",
    "pgEnabled",
    "fareInputMode",
    "travelClass",
    "ticketStatus",
    "totalPassengers",
    "cancelPassengers",
    "enteredTotalAmount",
    "pureTotalFareEntered",
    "purePerPaxFareEntered",
    "hasCatering",
    "cateringLastEdited",
    "totalCateringFee",
    "perPaxCateringFee",
    "hasInsurance",
    "insurancePerPax",
    "insuranceRefundable",
    "hoursBeforeDeparture",
    "chartPrepared",
    "roundToNextFive",
  ] as const;

  for (const field of requiredFields) {
    if (!(field in body)) errors.push(`${field} is required.`);
  }

  if (!isOneOf(body.ruleRegime, ruleRegimes)) {
    errors.push("ruleRegime is not supported.");
  }
  if (!isOneOf(body.bookingSource, bookingSources)) {
    errors.push("bookingSource is not supported.");
  }
  if (!isOneOf(body.paymentMethod, paymentMethods)) {
    errors.push("paymentMethod is not supported.");
  }
  if (!isOneOf(body.fareInputMode, fareInputModes)) {
    errors.push("fareInputMode is not supported.");
  }
  if (!isOneOf(body.travelClass, travelClasses)) {
    errors.push("travelClass is not supported.");
  }
  if (!isOneOf(body.ticketStatus, ticketStatuses)) {
    errors.push("ticketStatus is not supported.");
  }
  if (!isOneOf(body.cateringLastEdited, cateringLastEditedValues)) {
    errors.push("cateringLastEdited must be TOTAL or PER_PAX.");
  }

  const booleanFields = [
    "pgEnabled",
    "hasCatering",
    "hasInsurance",
    "insuranceRefundable",
    "chartPrepared",
    "roundToNextFive",
  ] as const;
  for (const field of booleanFields) {
    if (typeof body[field] !== "boolean") {
      errors.push(`${field} must be a boolean.`);
    }
  }

  const numericFields = [
    "totalPassengers",
    "cancelPassengers",
    "enteredTotalAmount",
    "pureTotalFareEntered",
    "purePerPaxFareEntered",
    "totalCateringFee",
    "perPaxCateringFee",
    "insurancePerPax",
    "hoursBeforeDeparture",
  ] as const;
  for (const field of numericFields) {
    const value = body[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`${field} must be a finite number.`);
    }
  }

  const totalPassengers = body.totalPassengers;
  const cancelPassengers = body.cancelPassengers;
  if (
    typeof totalPassengers === "number" &&
    (!Number.isInteger(totalPassengers) ||
      totalPassengers < 1 ||
      totalPassengers > 12)
  ) {
    errors.push("totalPassengers must be an integer from 1 to 12.");
  }
  if (
    typeof cancelPassengers === "number" &&
    (!Number.isInteger(cancelPassengers) ||
      cancelPassengers < 1 ||
      cancelPassengers > 12)
  ) {
    errors.push("cancelPassengers must be an integer from 1 to 12.");
  }
  if (
    typeof totalPassengers === "number" &&
    typeof cancelPassengers === "number" &&
    Number.isInteger(totalPassengers) &&
    Number.isInteger(cancelPassengers) &&
    cancelPassengers > totalPassengers
  ) {
    errors.push("cancelPassengers cannot exceed totalPassengers.");
  }

  for (const field of [
    "enteredTotalAmount",
    "pureTotalFareEntered",
    "purePerPaxFareEntered",
    "totalCateringFee",
    "perPaxCateringFee",
  ] as const) {
    const value = body[field];
    if (
      typeof value === "number" &&
      (value < 0 || value > MAX_AMOUNT)
    ) {
      errors.push(`${field} must be between 0 and ${MAX_AMOUNT}.`);
    }
  }
  if (
    typeof body.insurancePerPax === "number" &&
    (body.insurancePerPax < 0 || body.insurancePerPax > 10_000)
  ) {
    errors.push("insurancePerPax must be between 0 and 10000.");
  }
  if (
    typeof body.hoursBeforeDeparture === "number" &&
    (body.hoursBeforeDeparture < 0 ||
      body.hoursBeforeDeparture > MAX_HOURS_BEFORE_DEPARTURE)
  ) {
    errors.push(
      `hoursBeforeDeparture must be between 0 and ${MAX_HOURS_BEFORE_DEPARTURE}.`,
    );
  }

  if (
    body.fareInputMode === "GRAND_TOTAL" &&
    typeof body.enteredTotalAmount === "number" &&
    body.enteredTotalAmount <= 0
  ) {
    errors.push("enteredTotalAmount must be greater than 0 in GRAND_TOTAL mode.");
  }
  if (
    body.fareInputMode === "PURE_FARE" &&
    typeof body.pureTotalFareEntered === "number" &&
    body.pureTotalFareEntered <= 0
  ) {
    errors.push("pureTotalFareEntered must be greater than 0 in PURE_FARE mode.");
  }
  if (
    body.hasInsurance === true &&
    typeof body.insurancePerPax === "number" &&
    body.insurancePerPax <= 0
  ) {
    errors.push("insurancePerPax must be greater than 0 when insurance is enabled.");
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    input: {
      ruleRegime: body.ruleRegime as IRCTCRefundInput["ruleRegime"],
      bookingSource: body.bookingSource as IRCTCBookingSource,
      paymentMethod: body.paymentMethod as IRCTCPaymentMethod,
      pgEnabled: body.pgEnabled as boolean,
      fareInputMode: body.fareInputMode as IRCTCFareInputMode,
      travelClass: body.travelClass as IRCTCTravelClass,
      ticketStatus: body.ticketStatus as IRCTCTicketStatus,
      totalPassengers: body.totalPassengers as number,
      cancelPassengers: body.cancelPassengers as number,
      enteredTotalAmount: body.enteredTotalAmount as number,
      pureTotalFareEntered: body.pureTotalFareEntered as number,
      purePerPaxFareEntered: body.purePerPaxFareEntered as number,
      hasCatering: body.hasCatering as boolean,
      cateringLastEdited: body.cateringLastEdited as string,
      totalCateringFee: body.totalCateringFee as number,
      perPaxCateringFee: body.perPaxCateringFee as number,
      hasInsurance: body.hasInsurance as boolean,
      insurancePerPax: body.insurancePerPax as number,
      insuranceRefundable: body.insuranceRefundable as boolean,
      hoursBeforeDeparture: body.hoursBeforeDeparture as number,
      chartPrepared: body.chartPrepared as boolean,
      roundToNextFive: body.roundToNextFive as boolean,
    },
  };
}

function getTimingOperationResponse(body: Record<string, unknown>) {
  if (body.operation === "current-time") {
    if (typeof body.timeZone !== "string" || body.timeZone.trim() === "") {
      return jsonResponse({
        error: "Invalid timing input.",
        fieldErrors: [
          { field: "timeZone", code: "required", message: "timeZone is required." },
        ],
      }, 400);
    }
    try {
      return jsonResponse({
        currentDateTimeLocal: getCurrentLocalDateTime(body.timeZone),
      });
    } catch {
      return jsonResponse({
        error: "Invalid timing input.",
        fieldErrors: [
          { field: "timeZone", code: "time_zone", message: "timeZone must be a valid IANA timezone." },
        ],
      }, 400);
    }
  }

  if (body.operation === "select-time-band") {
    if (
      typeof body.ruleRegime !== "string" ||
      typeof body.quickTimeBandId !== "string" ||
      typeof body.timeZone !== "string"
    ) {
      return jsonResponse({
        error: "Invalid timing input.",
        fieldErrors: [
          { field: "quickTimeBandId", code: "required", message: "A quick time band is required." },
        ],
      }, 400);
    }
    const timing = resolveIRCTCTiming({
      ruleRegime: body.ruleRegime as IRCTCRuleRegime,
      cancellationDateTimeLocal: "",
      departureDateTimeLocal: "",
      timeZone: body.timeZone,
      quickTimeBandId: body.quickTimeBandId as IRCTCQuickTimeBandId,
    });
    if (!timing.ok) {
      return jsonResponse({ error: "Invalid timing input.", fieldErrors: timing.errors }, 400);
    }
    return jsonResponse({ timing: timing.timing, chartPrepared: false });
  }

  if (body.operation === "select-hours") {
    if (
      typeof body.hoursBeforeDeparture !== "number" ||
      typeof body.ruleRegime !== "string" ||
      typeof body.timeZone !== "string"
    ) {
      return jsonResponse({
        error: "Invalid timing input.",
        fieldErrors: [
          { field: "hoursBeforeDeparture", code: "type", message: "hoursBeforeDeparture and timezone settings are required." },
        ],
      }, 400);
    }
    if (!["ACTUAL_48H", "VB_SLEEPER_72H"].includes(body.ruleRegime)) {
      return jsonResponse({
        error: "Invalid timing input.",
        fieldErrors: [
          { field: "ruleRegime", code: "enum", message: "ruleRegime is not supported." },
        ],
      }, 400);
    }
    const timing = createIRCTCTimingFromHours(
      body.hoursBeforeDeparture,
      body.ruleRegime as IRCTCRuleRegime,
      body.timeZone,
      null,
    );
    if (!timing.ok) {
      return jsonResponse({ error: "Invalid timing input.", fieldErrors: timing.errors }, 400);
    }
    return jsonResponse({ timing: timing.timing, chartPrepared: body.chartPrepared === true });
  }

  if (body.operation === "timing-preview") {
    const timing = resolveIRCTCTiming({
      ruleRegime: body.ruleRegime as IRCTCRuleRegime,
      cancellationDateTimeLocal:
        typeof body.cancellationDateTimeLocal === "string"
          ? body.cancellationDateTimeLocal
          : "",
      departureDateTimeLocal:
        typeof body.departureDateTimeLocal === "string"
          ? body.departureDateTimeLocal
          : "",
      timeZone: typeof body.timeZone === "string" ? body.timeZone : "",
      quickTimeBandId: body.quickTimeBandId as IRCTCQuickTimeBandId | null,
    });
    if (!timing.ok) {
      return jsonResponse({ error: "Invalid timing input.", fieldErrors: timing.errors }, 400);
    }
    return jsonResponse({ timing: timing.timing });
  }

  return null;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return jsonResponse({ error: "Content-Type must be application/json." }, 415);
  }

  const contentLength = request.headers.get("content-length");
  if (
    contentLength !== null &&
    (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_REQUEST_BYTES)
  ) {
    return jsonResponse({ error: "Request body is too large." }, 413);
  }

  let rawBody: string | null;
  try {
    rawBody = await readLimitedBody(request);
  } catch {
    return jsonResponse({ error: "Unable to read a valid UTF-8 request body." }, 400);
  }

  if (rawBody === null) {
    return jsonResponse({ error: "Request body is too large." }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Request body must contain valid JSON." }, 400);
  }

  if (isRecord(body)) {
    if ("operation" in body && typeof body.operation !== "string") {
      return jsonResponse(
        { error: "operation must be a string." },
        400,
      );
    }
    if (body.operation === "metadata") {
      if (!exactKeys(body, ["operation"])) {
        return jsonResponse({ error: "Unsupported request fields." }, 400);
      }
      return jsonResponse(getIRCTCCalculatorMetadata());
    }
    if (body.operation === "normalize") {
      if (!exactKeys(body, ["operation", "state", "changedField", "presetId"])) {
        return jsonResponse({ error: "Unsupported request fields." }, 400);
      }
      return workflowResponse(normalizeIRCTCFormState(body));
    }
    if (body.operation === "scenario") {
      if (!exactKeys(body, ["operation", "scenarioId", "timeZone"])) {
        return jsonResponse({ error: "Unsupported request fields." }, 400);
      }
      return workflowResponse(resolveIRCTCScenario(body));
    }
    if (body.operation === "calculate") {
      const allowedKeys = [
        "operation",
        "bookingSource",
        "paymentMethod",
        "ruleRegime",
        "travelClass",
        "ticketStatus",
        "fareInputMode",
        "pgEnabled",
        "chartPrepared",
        "roundToNextFive",
        "totalPassengersRaw",
        "cancelPassengersRaw",
        "enteredTotalAmountRaw",
        "pureTotalFareEnteredRaw",
        "purePerPaxFareEnteredRaw",
        "hasCatering",
        "cateringLastEdited",
        "totalCateringFeeRaw",
        "perPaxCateringFeeRaw",
        "hasInsurance",
        "insurancePerPaxRaw",
        "insuranceRefundable",
        "cancellationDateTimeLocal",
        "departureDateTimeLocal",
        "timeZone",
        "quickTimeBandId",
      ];
      if (!exactKeys(body, allowedKeys)) {
        return jsonResponse({ error: "Request fields do not match the calculator schema." }, 400);
      }
      try {
        return workflowResponse(calculateIRCTCWorkflow(body));
      } catch (error) {
        console.error("IRCTC refund calculation failed.", error);
        return jsonResponse(
          { error: "Unable to calculate the refund right now." },
          500,
        );
      }
    }
    const exactTimingKeys: Record<string, readonly string[]> = {
      "current-time": ["operation", "timeZone"],
      "select-time-band": ["operation", "ruleRegime", "quickTimeBandId", "timeZone"],
      "select-hours": [
        "operation",
        "ruleRegime",
        "hoursBeforeDeparture",
        "timeZone",
        "chartPrepared",
      ],
      "timing-preview": [
        "operation",
        "ruleRegime",
        "cancellationDateTimeLocal",
        "departureDateTimeLocal",
        "timeZone",
        "quickTimeBandId",
      ],
    };
    if (
      typeof body.operation === "string" &&
      exactTimingKeys[body.operation] &&
      !exactKeys(body, exactTimingKeys[body.operation])
    ) {
      return jsonResponse({ error: "Unsupported request fields." }, 400);
    }
    const timingResponse = getTimingOperationResponse(body);
    if (timingResponse) return timingResponse;
  }

  if (isRecord(body) && typeof body.operation === "string") {
    return jsonResponse({ error: "Unsupported calculator operation." }, 400);
  }

  const validation = validateInput(body);
  if (!validation.ok) {
    return jsonResponse(
      { error: "Invalid refund calculator input.", details: validation.errors },
      400,
    );
  }

  try {
    const result = calculateIRCTCRefund(validation.input);
    return jsonResponse({
      result: {
        display: result.display,
        visibility: result.visibility,
      },
    });
  } catch (error) {
    console.error("IRCTC refund calculation failed.", error);
    return jsonResponse(
      { error: "Unable to calculate the refund right now." },
      500,
    );
  }
}
