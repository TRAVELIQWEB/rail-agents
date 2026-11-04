import "server-only";

import {
  calculateIRCTCRefund,
  type IRCTCRefundInput,
} from "./irctc-refund-calculator";
import {
  createIRCTCTimingFromHours,
  MAX_PASSENGERS,
  normalizeAndValidateRawIRCTCRefundRequest,
  resolveIRCTCTiming,
  type IRCTCQuickTimeBandId,
  type IRCTCRuleRegime,
  type RawIRCTCRefundRequest,
} from "./irctc-refund-request";

export type IRCTCChangedField =
  | "bookingSource"
  | "paymentMethod"
  | "ruleRegime"
  | "travelClass"
  | "ticketStatus"
  | "pgEnabled"
  | "chartPrepared"
  | "roundToNextFive"
  | "insuranceRefundable"
  | "toggleRuleRegime"
  | "togglePgEnabled"
  | "toggleRounding"
  | "totalPassengersRaw"
  | "cancelPassengersRaw"
  | "enteredTotalAmountRaw"
  | "pureTotalFareEnteredRaw"
  | "purePerPaxFareEnteredRaw"
  | "totalCateringFeeRaw"
  | "perPaxCateringFeeRaw"
  | "insurancePerPaxRaw"
  | "fareInputMode"
  | "hasCatering"
  | "hasInsurance"
  | "cateringPreset"
  | "insurancePreset";

export type IRCTCFormState = Omit<
  RawIRCTCRefundRequest,
  "operation" | "bookingSource" | "travelClass" | "ticketStatus"
> & {
  bookingSource: RawIRCTCRefundRequest["bookingSource"] | "";
  travelClass: RawIRCTCRefundRequest["travelClass"] | "";
  ticketStatus: RawIRCTCRefundRequest["ticketStatus"] | "";
};

export interface IRCTCWorkflowError {
  field: string;
  code: string;
  message: string;
}

export type IRCTCWorkflowResult =
  | { ok: true; response: Record<string, unknown> }
  | { ok: false; errors: IRCTCWorkflowError[] };

const defaultFormState: IRCTCFormState = {
  bookingSource: "",
  paymentMethod: "CARD",
  ruleRegime: "ACTUAL_48H",
  travelClass: "",
  ticketStatus: "",
  fareInputMode: "GRAND_TOTAL",
  pgEnabled: true,
  chartPrepared: false,
  roundToNextFive: true,
  totalPassengersRaw: "0",
  cancelPassengersRaw: "0",
  enteredTotalAmountRaw: "",
  pureTotalFareEnteredRaw: "0",
  purePerPaxFareEnteredRaw: "0",
  hasCatering: false,
  cateringLastEdited: "TOTAL",
  totalCateringFeeRaw: "0",
  perPaxCateringFeeRaw: "0",
  hasInsurance: false,
  insurancePerPaxRaw: "0",
  insuranceRefundable: false,
  cancellationDateTimeLocal: "",
  departureDateTimeLocal: "",
  timeZone: "UTC",
  quickTimeBandId: null,
};

const allowedStateFields = new Set(
  Object.keys(defaultFormState) as Array<keyof IRCTCFormState>,
);

const changedFields = new Set<IRCTCChangedField>([
  "bookingSource",
  "paymentMethod",
  "ruleRegime",
  "travelClass",
  "ticketStatus",
  "pgEnabled",
  "chartPrepared",
  "roundToNextFive",
  "insuranceRefundable",
  "toggleRuleRegime",
  "togglePgEnabled",
  "toggleRounding",
  "totalPassengersRaw",
  "cancelPassengersRaw",
  "enteredTotalAmountRaw",
  "pureTotalFareEnteredRaw",
  "purePerPaxFareEnteredRaw",
  "totalCateringFeeRaw",
  "perPaxCateringFeeRaw",
  "insurancePerPaxRaw",
  "fareInputMode",
  "hasCatering",
  "hasInsurance",
  "cateringPreset",
  "insurancePreset",
]);

const cateringPresets = {
  vandeBharat: { amount: 363, label: "₹363 · Vande Bharat" },
  economy: { amount: 150, label: "₹150" },
  standard: { amount: 300, label: "₹300" },
} as const;

const insurancePresets = {
  standard: { amount: 0.45, label: "₹0.45" },
  reduced: { amount: 0.35, label: "₹0.35" },
} as const;

const quickTimeBandPresentation = [
  {
    id: "80",
    regular: ["More than 48 hours", "Flat class-wise charge"],
    sleeper: ["More than 72 hours", "25% charge; no flat fee"],
  },
  {
    id: "14.83",
    regular: ["48 to 12 hours", "25% cancellation charge"],
    sleeper: ["72 to 24 hours", "50% cancellation charge"],
  },
  {
    id: "9",
    regular: ["Under 12h to over 4h", "50%, before chart preparation"],
    sleeper: ["Under 24h to over 8h", "50% cancellation charge"],
  },
  {
    id: "2",
    regular: [
      "Chart prepared / under 4h",
      "Confirmed: no refund · RAC/WL rules apply",
    ],
    sleeper: ["Chart prepared / under 8h", "Confirmed: no refund under 8h"],
  },
  {
    id: "0.25",
    regular: ["Under 30 minutes", "Waitlist rules may apply"],
    sleeper: ["Under 30 minutes", "Waitlist rules may apply"],
  },
] as const;

const allowedValues = {
  bookingSource: ["", "PERSONAL", "AGENT", "COUNTER"],
  paymentMethod: ["CARD", "UPI"],
  ruleRegime: ["ACTUAL_48H", "VB_SLEEPER_72H"],
  travelClass: ["", "1AC", "2AC", "3AC", "SL", "2S"],
  ticketStatus: ["", "CNF", "RAC", "WL", "TQ_CNF", "TQWL", "TRAIN_CANCELLED"],
  fareInputMode: ["GRAND_TOTAL", "PURE_FARE"],
  cateringLastEdited: ["TOTAL", "PER_PAX"],
} as const;

const scenarios: Record<
  string,
  { state: Partial<IRCTCFormState>; hours: number; label: string }
> = {
  TC_REFERENCE: {
    label:
      "Reference ticket scenario: Vande Bharat CC (regular 48h/12h rules · ₹355 charge)",
    hours: 14.83,
    state: {
      ruleRegime: "ACTUAL_48H",
      bookingSource: "AGENT",
      paymentMethod: "CARD",
      pgEnabled: true,
      fareInputMode: "GRAND_TOTAL",
      hasCatering: true,
      totalCateringFeeRaw: "363",
      perPaxCateringFeeRaw: "363",
      hasInsurance: false,
      insurancePerPaxRaw: "0.45",
      insuranceRefundable: true,
      travelClass: "3AC",
      ticketStatus: "CNF",
      totalPassengersRaw: "1",
      cancelPassengersRaw: "1",
      enteredTotalAmountRaw: "1481.13",
      pureTotalFareEnteredRaw: "1032",
      purePerPaxFareEnteredRaw: "1032",
      chartPrepared: false,
      roundToNextFive: true,
    },
  },
  TC_VBSLEEPER: {
    label:
      "Gazette G.S.R. 41(E): Vande Bharat Sleeper (72h–8h = 50% charge · ₹700)",
    hours: 14.83,
    state: {
      ruleRegime: "VB_SLEEPER_72H",
      bookingSource: "AGENT",
      paymentMethod: "CARD",
      pgEnabled: true,
      fareInputMode: "GRAND_TOTAL",
      hasCatering: true,
      totalCateringFeeRaw: "363",
      perPaxCateringFeeRaw: "363",
      hasInsurance: false,
      insurancePerPaxRaw: "0.45",
      insuranceRefundable: true,
      travelClass: "3AC",
      ticketStatus: "CNF",
      totalPassengersRaw: "1",
      cancelPassengersRaw: "1",
      enteredTotalAmountRaw: "1481.13",
      pureTotalFareEnteredRaw: "1032",
      purePerPaxFareEnteredRaw: "1032",
      chartPrepared: false,
      roundToNextFive: true,
    },
  },
  TC1: {
    label: "Test 1: Personal + 3AC + insurance (>48h = ₹190/passenger)",
    hours: 60,
    state: {
      bookingSource: "PERSONAL",
      paymentMethod: "CARD",
      pgEnabled: false,
      fareInputMode: "GRAND_TOTAL",
      hasCatering: false,
      totalCateringFeeRaw: "0",
      perPaxCateringFeeRaw: "0",
      hasInsurance: true,
      insurancePerPaxRaw: "0.45",
      insuranceRefundable: true,
      travelClass: "3AC",
      ticketStatus: "CNF",
      totalPassengersRaw: "2",
      cancelPassengersRaw: "2",
      enteredTotalAmountRaw: "2036.3",
      pureTotalFareEnteredRaw: "2000",
      purePerPaxFareEnteredRaw: "1000",
      chartPrepared: false,
      roundToNextFive: true,
    },
  },
  TC2: {
    label: "Test 2: Agent ≤ ₹2000 (PG Base ₹1535.85 @ 0.75% = ₹11.52)",
    hours: 60,
    state: {
      bookingSource: "AGENT",
      paymentMethod: "CARD",
      pgEnabled: true,
      fareInputMode: "GRAND_TOTAL",
      hasCatering: false,
      totalCateringFeeRaw: "0",
      perPaxCateringFeeRaw: "0",
      hasInsurance: true,
      insurancePerPaxRaw: "0.45",
      insuranceRefundable: true,
      travelClass: "2AC",
      ticketStatus: "CNF",
      totalPassengersRaw: "1",
      cancelPassengersRaw: "1",
      enteredTotalAmountRaw: "1587.37",
      pureTotalFareEnteredRaw: "1500",
      purePerPaxFareEnteredRaw: "1500",
      chartPrepared: false,
      roundToNextFive: true,
    },
  },
  TC3: {
    label: "Test 3: Agent > ₹2000 (PG Base ₹2736.30 @ 1% = ₹27.36)",
    hours: 24,
    state: {
      bookingSource: "AGENT",
      paymentMethod: "CARD",
      pgEnabled: true,
      fareInputMode: "GRAND_TOTAL",
      hasCatering: true,
      totalCateringFeeRaw: "300",
      perPaxCateringFeeRaw: "150",
      hasInsurance: true,
      insurancePerPaxRaw: "0.45",
      insuranceRefundable: true,
      travelClass: "3AC",
      ticketStatus: "CNF",
      totalPassengersRaw: "2",
      cancelPassengersRaw: "2",
      enteredTotalAmountRaw: "2803.66",
      pureTotalFareEnteredRaw: "2400",
      purePerPaxFareEnteredRaw: "1200",
      chartPrepared: false,
      roundToNextFive: true,
    },
  },
  TC4: {
    label: "Test 4: Waitlist (<30m = not ₹0, ₹65/passenger)",
    hours: 0.25,
    state: {
      bookingSource: "PERSONAL",
      paymentMethod: "UPI",
      pgEnabled: false,
      fareInputMode: "GRAND_TOTAL",
      hasCatering: false,
      totalCateringFeeRaw: "0",
      perPaxCateringFeeRaw: "0",
      hasInsurance: false,
      insurancePerPaxRaw: "0.45",
      insuranceRefundable: true,
      travelClass: "3AC",
      ticketStatus: "WL",
      totalPassengersRaw: "2",
      cancelPassengersRaw: "2",
      enteredTotalAmountRaw: "2011.8",
      pureTotalFareEnteredRaw: "2000",
      purePerPaxFareEnteredRaw: "1000",
      chartPrepared: true,
      roundToNextFive: true,
    },
  },
  TC5: {
    label:
      "Test 5: Train cancelled (₹0 railway deduction · 100% fare refund)",
    hours: 2,
    state: {
      bookingSource: "AGENT",
      paymentMethod: "CARD",
      pgEnabled: true,
      fareInputMode: "GRAND_TOTAL",
      hasCatering: true,
      totalCateringFeeRaw: "363",
      perPaxCateringFeeRaw: "363",
      hasInsurance: false,
      insurancePerPaxRaw: "0.45",
      insuranceRefundable: true,
      travelClass: "3AC",
      ticketStatus: "TRAIN_CANCELLED",
      totalPassengersRaw: "1",
      cancelPassengersRaw: "1",
      enteredTotalAmountRaw: "1481.13",
      pureTotalFareEnteredRaw: "1032",
      purePerPaxFareEnteredRaw: "1032",
      chartPrepared: true,
      roundToNextFive: true,
    },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseCount(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value.trim());
  return Number.isInteger(parsed) ? parsed : undefined;
}

function roundToTwo(value: number): number {
  return Number(value.toFixed(2));
}

function validateFormState(value: unknown):
  | { ok: true; state: IRCTCFormState }
  | { ok: false; errors: IRCTCWorkflowError[] } {
  if (!isRecord(value)) {
    return {
      ok: false,
      errors: [{ field: "state", code: "type", message: "state must be an object." }],
    };
  }
  const errors: IRCTCWorkflowError[] = [];
  for (const key of Object.keys(value)) {
    if (!allowedStateFields.has(key as keyof IRCTCFormState)) {
      errors.push({
        field: key,
        code: "unexpected",
        message: `${key} is not a supported state field.`,
      });
    }
  }
  const state = { ...defaultFormState } as IRCTCFormState;
  for (const key of allowedStateFields) {
    if (!(key in value)) continue;
    const raw = value[key];
    if (
      key.endsWith("Raw") ||
      key === "cancellationDateTimeLocal" ||
      key === "departureDateTimeLocal" ||
      key === "timeZone"
    ) {
      if (typeof raw !== "string") {
        errors.push({
          field: key,
          code: "type",
          message: `${key} must be a string.`,
        });
      } else {
        (state as unknown as Record<string, unknown>)[key] = raw;
      }
    } else if (key === "quickTimeBandId") {
      if (raw !== null && typeof raw !== "string") {
        errors.push({
          field: key,
          code: "type",
          message: "quickTimeBandId must be a string or null.",
        });
      } else {
        state.quickTimeBandId = raw as IRCTCQuickTimeBandId | null;
      }
    } else if (typeof raw === "boolean") {
      (state as unknown as Record<string, unknown>)[key] = raw;
    } else if (typeof raw === "string") {
      (state as unknown as Record<string, unknown>)[key] = raw;
    } else {
      errors.push({
        field: key,
        code: "type",
        message: `${key} has an invalid value type.`,
      });
    }
  }
  for (const [field, values] of Object.entries(allowedValues)) {
    const fieldValue = (state as unknown as Record<string, unknown>)[field] ??
      (value as Record<string, unknown>)[field];
    if (
      typeof fieldValue !== "string" ||
      !(values as readonly string[]).includes(fieldValue)
    ) {
      errors.push({
        field,
        code: "enum",
        message: `${field} is not supported.`,
      });
    }
  }
  for (const field of [
    "pgEnabled",
    "chartPrepared",
    "roundToNextFive",
    "hasCatering",
    "hasInsurance",
    "insuranceRefundable",
  ] as const) {
    if (typeof state[field] !== "boolean") {
      errors.push({
        field,
        code: "type",
        message: `${field} must be a boolean.`,
      });
    }
  }
  if (
    state.quickTimeBandId !== null &&
    !quickTimeBandPresentation.some((band) => band.id === state.quickTimeBandId)
  ) {
    errors.push({
      field: "quickTimeBandId",
      code: "enum",
      message: "quickTimeBandId is not supported.",
    });
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, state };
}

function normalizeState(
  state: IRCTCFormState,
  changedField: IRCTCChangedField,
  presetId?: string,
): IRCTCFormState {
  const next = { ...state };
  if (changedField === "toggleRuleRegime") {
    next.ruleRegime =
      next.ruleRegime === "ACTUAL_48H" ? "VB_SLEEPER_72H" : "ACTUAL_48H";
  } else if (changedField === "togglePgEnabled") {
    next.pgEnabled = !next.pgEnabled;
  } else if (changedField === "toggleRounding") {
    next.roundToNextFive = !next.roundToNextFive;
  } else if (changedField === "totalPassengersRaw") {
    const parsed = parseCount(next.totalPassengersRaw);
    if (parsed !== undefined) {
      const total = Math.max(1, Math.min(MAX_PASSENGERS, parsed || 1));
      next.totalPassengersRaw = String(total);
      const cancelling = parseCount(next.cancelPassengersRaw);
      if (cancelling !== undefined && cancelling > total) {
        next.cancelPassengersRaw = String(total);
      }
      if (
        next.fareInputMode === "PURE_FARE" &&
        (finiteNumber(next.purePerPaxFareEnteredRaw) ?? 0) > 0
      ) {
        next.pureTotalFareEnteredRaw = String(
          roundToTwo(
            (finiteNumber(next.purePerPaxFareEnteredRaw) ?? 0) * total,
          ),
        );
      }
      if (next.hasCatering) {
        next.totalCateringFeeRaw = String(
          roundToTwo(
            (finiteNumber(next.perPaxCateringFeeRaw) ?? 0) * total,
          ),
        );
      }
    }
  } else if (changedField === "cancelPassengersRaw") {
    const parsed = parseCount(next.cancelPassengersRaw);
    if (parsed !== undefined) {
      const total = parseCount(next.totalPassengersRaw) ?? 0;
      next.cancelPassengersRaw = String(
        Math.max(1, Math.min(total, parsed || 1)),
      );
    }
  } else if (changedField === "pureTotalFareEnteredRaw") {
    const total = finiteNumber(next.pureTotalFareEnteredRaw);
    if (total !== undefined) {
      const passengers = Math.max(1, parseCount(next.totalPassengersRaw) ?? 0);
      next.purePerPaxFareEnteredRaw = String(
        roundToTwo(total / passengers),
      );
    } else if (next.pureTotalFareEnteredRaw.trim() === "") {
      next.purePerPaxFareEnteredRaw = "0";
    }
  } else if (changedField === "purePerPaxFareEnteredRaw") {
    const perPassenger = finiteNumber(next.purePerPaxFareEnteredRaw);
    if (perPassenger !== undefined) {
      const passengers = parseCount(next.totalPassengersRaw) ?? 0;
      next.pureTotalFareEnteredRaw = String(
        roundToTwo(perPassenger * passengers),
      );
    } else if (next.purePerPaxFareEnteredRaw.trim() === "") {
      next.pureTotalFareEnteredRaw = "0";
    }
  } else if (changedField === "totalCateringFeeRaw") {
    const total = finiteNumber(next.totalCateringFeeRaw);
    if (total !== undefined) {
      const passengers = Math.max(1, parseCount(next.totalPassengersRaw) ?? 0);
      next.perPaxCateringFeeRaw = String(
        roundToTwo(total / passengers),
      );
    } else if (next.totalCateringFeeRaw.trim() === "") {
      next.perPaxCateringFeeRaw = "0";
    }
  } else if (changedField === "perPaxCateringFeeRaw") {
    const perPassenger = finiteNumber(next.perPaxCateringFeeRaw);
    if (perPassenger !== undefined) {
      const passengers = parseCount(next.totalPassengersRaw) ?? 0;
      next.totalCateringFeeRaw = String(
        roundToTwo(perPassenger * passengers),
      );
    } else if (next.perPaxCateringFeeRaw.trim() === "") {
      next.totalCateringFeeRaw = "0";
    }
  } else if (changedField === "hasCatering" && next.hasCatering) {
    if ((finiteNumber(next.totalCateringFeeRaw) ?? 0) <= 0) {
      const passengers = parseCount(next.totalPassengersRaw) ?? 0;
      next.perPaxCateringFeeRaw = String(cateringPresets.vandeBharat.amount);
      next.totalCateringFeeRaw = String(
        cateringPresets.vandeBharat.amount * passengers,
      );
    }
  } else if (changedField === "cateringPreset") {
    const preset =
      typeof presetId === "string" &&
      Object.prototype.hasOwnProperty.call(cateringPresets, presetId)
        ? cateringPresets[presetId as keyof typeof cateringPresets]
        : null;
    if (preset) {
      const passengers = parseCount(next.totalPassengersRaw) ?? 0;
      next.hasCatering = true;
      next.perPaxCateringFeeRaw = String(preset.amount);
      next.totalCateringFeeRaw = String(
        roundToTwo(preset.amount * passengers),
      );
    }
  } else if (changedField === "insurancePreset") {
    const preset =
      typeof presetId === "string" &&
      Object.prototype.hasOwnProperty.call(insurancePresets, presetId)
        ? insurancePresets[presetId as keyof typeof insurancePresets]
        : null;
    if (preset) {
      next.insurancePerPaxRaw = String(preset.amount);
      next.hasInsurance = true;
    }
  } else if (
    changedField === "hasInsurance" &&
    next.hasInsurance &&
    (finiteNumber(next.insurancePerPaxRaw) ?? 0) <= 0
  ) {
    next.insurancePerPaxRaw = String(insurancePresets.standard.amount);
  }
  return next;
}

function stateSummary(state: IRCTCFormState) {
  const totalPassengers = parseCount(state.totalPassengersRaw);
  const regular = state.ruleRegime === "ACTUAL_48H";
  const insuranceRate = finiteNumber(state.insurancePerPaxRaw);
  const timing = resolveIRCTCTiming({
    ruleRegime: state.ruleRegime,
    cancellationDateTimeLocal: state.cancellationDateTimeLocal,
    departureDateTimeLocal: state.departureDateTimeLocal,
    timeZone: state.timeZone,
    quickTimeBandId: state.quickTimeBandId,
  });
  return {
    activeQuickTimeBandId: timing.ok
      ? timing.timing.activeQuickTimeBandId
      : null,
    disabledCancelPassengerOptions: [1, 2, 3, 4, 5, 6]
      .filter((count) => count > (totalPassengers ?? 0))
      .map(String),
    selectedInsurancePresetId:
      Object.entries(insurancePresets).find(([, preset]) => preset.amount === insuranceRate)?.[0] ??
      null,
    ruleRegimeBadge: regular
      ? "Regular trains (48h / 12h / 4h)"
      : "Vande Bharat Sleeper / Amrit Bharat II (72h / 8h)",
    timeBandSectionLabel: regular
      ? "Quick time bands · Regular trains / Vande Bharat CC (48h / 12h / 4h):"
      : "Quick time bands · Vande Bharat Sleeper / Amrit Bharat II (G.S.R. 41(E)):",
    timeBands: quickTimeBandPresentation.map((band) => ({
      id: band.id,
      label: regular ? band.regular : band.sleeper,
    })),
    ruleRegimeButtonLabels: {
      actual: "Regular trains · 48h / 12h / 4h",
      sleeper: "Vande Bharat Sleeper / Amrit Bharat II · 72h / 8h",
    },
    paymentGatewayToggleLabel: state.pgEnabled
      ? "Payment gateway: On (0.75% / 1%)"
      : "Payment gateway: Off (₹0)",
    roundingToggleLabel: state.roundToNextFive
      ? "₹5 rounding: On"
      : "₹5 rounding: Exact",
    visibility: {
      personalPaymentOptions: state.bookingSource === "PERSONAL",
      agentPaymentGatewayOptions: state.bookingSource === "AGENT",
      grandTotalFareInput: state.fareInputMode === "GRAND_TOTAL",
      pureFareInputs: state.fareInputMode === "PURE_FARE",
      cateringInputs: state.hasCatering,
      insuranceInputs: state.hasInsurance,
      insuranceRefundEligible:
        state.hasInsurance &&
        state.insuranceRefundable &&
        state.bookingSource !== "COUNTER",
    },
  };
}

function mapValidationErrors(
  errors: Array<{ field: string; code: string; message: string }>,
): IRCTCWorkflowError[] {
  return errors.map(({ field, code, message }) => ({ field, code, message }));
}

export function getIRCTCCalculatorMetadata() {
  const initialState = { ...defaultFormState };
  return {
    initialState,
    initialSummary: stateSummary(initialState),
    timeBands: quickTimeBandPresentation,
    cateringPresets: Object.entries(cateringPresets).map(([id, preset]) => ({
      id,
      label: preset.label,
    })),
    insurancePresets: Object.entries(insurancePresets).map(([id, preset]) => ({
      id,
      label: preset.label,
    })),
    financialControlLabels: {
      paymentGatewayEnabled: "Payment gateway: On (0.75% / 1%)",
      paymentGatewayDisabled: "Payment gateway: Off (₹0)",
    },
    agentPaymentGatewayDescription:
      "Agent payment gateway rate is 0.75% up to ₹2,000 and 1% above ₹2,000.",
    scenarios: Object.entries(scenarios).map(([id, scenario]) => ({
      id,
      label: scenario.label,
    })),
  };
}

export function normalizeIRCTCFormState(
  value: unknown,
): IRCTCWorkflowResult {
  if (!isRecord(value) || !changedFields.has(value.changedField as IRCTCChangedField)) {
    return {
      ok: false,
      errors: [
        {
          field: "changedField",
          code: "enum",
          message: "changedField is not supported.",
        },
      ],
    };
  }
  const presetField =
    value.changedField === "cateringPreset" ||
    value.changedField === "insurancePreset";
  if (
    (presetField &&
      (typeof value.presetId !== "string" ||
        (value.changedField === "cateringPreset" &&
          !Object.prototype.hasOwnProperty.call(cateringPresets, value.presetId)) ||
        (value.changedField === "insurancePreset" &&
          !Object.prototype.hasOwnProperty.call(insurancePresets, value.presetId)))) ||
    (!presetField && value.presetId !== null)
  ) {
    return {
      ok: false,
      errors: [
        {
          field: "presetId",
          code: "enum",
          message: "presetId is not supported for the requested field.",
        },
      ],
    };
  }
  const validated = validateFormState(value.state);
  if (!validated.ok) return validated;
  const state = normalizeState(
    validated.state,
    value.changedField as IRCTCChangedField,
    typeof value.presetId === "string" ? value.presetId : undefined,
  );
  const summary = stateSummary(state);
  return {
    ok: true,
    response: {
      state,
      summary,
    },
  };
}

export function resolveIRCTCScenario(
  value: unknown,
): IRCTCWorkflowResult {
  if (!isRecord(value) || typeof value.scenarioId !== "string") {
    return {
      ok: false,
      errors: [
        { field: "scenarioId", code: "required", message: "scenarioId is required." },
      ],
    };
  }
  const scenario = scenarios[value.scenarioId];
  if (!scenario) {
    return {
      ok: false,
      errors: [
        { field: "scenarioId", code: "enum", message: "scenarioId is not supported." },
      ],
    };
  }
  const state = { ...defaultFormState, ...scenario.state };
  const timeZone = typeof value.timeZone === "string" ? value.timeZone : "UTC";
  const timing = createIRCTCTimingFromHours(
    scenario.hours,
    state.ruleRegime as IRCTCRuleRegime,
    timeZone,
    null,
  );
  if (!timing.ok) {
    return { ok: false, errors: mapValidationErrors(timing.errors) };
  }
  state.cancellationDateTimeLocal = timing.timing.cancellationDateTimeLocal;
  state.departureDateTimeLocal = timing.timing.departureDateTimeLocal;
  state.timeZone = timeZone;
  state.quickTimeBandId = null;
  return {
    ok: true,
    response: {
      state,
      summary: stateSummary(state),
      timing: timing.timing,
      scenarioLabel: scenario.label,
    },
  };
}

export function calculateIRCTCWorkflow(
  value: unknown,
): IRCTCWorkflowResult {
  const validation = normalizeAndValidateRawIRCTCRefundRequest(value);
  if (!validation.ok) {
    return {
      ok: false,
      errors: mapValidationErrors(validation.errors),
    };
  }
  const timing = resolveIRCTCTiming(validation.input);
  if (!timing.ok) {
    return {
      ok: false,
      errors: mapValidationErrors(timing.errors),
    };
  }
  const input: IRCTCRefundInput = {
    ruleRegime: validation.input.ruleRegime,
    bookingSource: validation.input.bookingSource,
    paymentMethod: validation.input.paymentMethod,
    pgEnabled: validation.input.pgEnabled,
    fareInputMode: validation.input.fareInputMode,
    travelClass: validation.input.travelClass,
    ticketStatus: validation.input.ticketStatus,
    totalPassengers: validation.input.totalPassengers,
    cancelPassengers: validation.input.cancelPassengers,
    enteredTotalAmount: validation.input.enteredTotalAmount,
    pureTotalFareEntered: validation.input.pureTotalFareEntered,
    purePerPaxFareEntered: validation.input.purePerPaxFareEntered,
    hasCatering: validation.input.hasCatering,
    cateringLastEdited: validation.input.cateringLastEdited,
    totalCateringFee: validation.input.totalCateringFee,
    perPaxCateringFee: validation.input.perPaxCateringFee,
    hasInsurance: validation.input.hasInsurance,
    insurancePerPax: validation.input.insurancePerPax,
    insuranceRefundable: validation.input.insuranceRefundable,
    hoursBeforeDeparture: timing.timing.hoursBeforeDeparture,
    chartPrepared: validation.input.chartPrepared,
    roundToNextFive: validation.input.roundToNextFive,
  };
  const result = calculateIRCTCRefund(input);
  const tone = result.calculation.alertStyle.match(/bg-(emerald|blue|rose|amber|orange)-/)?.[1];
  const display = {
    ...result.display,
    regimeComparisonNote: result.display.regimeComparisonNote
      .replace(/<strong>/g, "")
      .replace(/<\/strong>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&"),
  };
  delete (display as Partial<typeof display>).ruleExplanationAlertClassName;
  return {
    ok: true,
    response: {
      result: {
        display,
        visibility: result.visibility,
        alertTone: tone ?? "orange",
        timing: timing.timing,
      },
    },
  };
}
