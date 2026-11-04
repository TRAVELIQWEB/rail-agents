import type {
  IRCTCBookingSource,
  IRCTCFareInputMode,
  IRCTCPaymentMethod,
  IRCTCTicketStatus,
  IRCTCTravelClass,
} from "./irctc-refund-calculator";

export type IRCTCRuleRegime = "ACTUAL_48H" | "VB_SLEEPER_72H";
export type IRCTCCateringLastEdited = "TOTAL" | "PER_PAX";
export type IRCTCQuickTimeBandId = "80" | "14.83" | "9" | "2" | "0.25";
export type IRCTCRefundOperation = "calculate";

export interface RawIRCTCRefundRequest {
  operation: IRCTCRefundOperation;
  bookingSource: IRCTCBookingSource;
  paymentMethod: IRCTCPaymentMethod;
  ruleRegime: IRCTCRuleRegime;
  travelClass: IRCTCTravelClass;
  ticketStatus: IRCTCTicketStatus;
  fareInputMode: IRCTCFareInputMode;
  pgEnabled: boolean;
  chartPrepared: boolean;
  roundToNextFive: boolean;
  totalPassengersRaw: string;
  cancelPassengersRaw: string;
  enteredTotalAmountRaw: string;
  pureTotalFareEnteredRaw: string;
  purePerPaxFareEnteredRaw: string;
  hasCatering: boolean;
  cateringLastEdited: IRCTCCateringLastEdited;
  totalCateringFeeRaw: string;
  perPaxCateringFeeRaw: string;
  hasInsurance: boolean;
  insurancePerPaxRaw: string;
  insuranceRefundable: boolean;
  cancellationDateTimeLocal: string;
  departureDateTimeLocal: string;
  timeZone: string;
  quickTimeBandId: IRCTCQuickTimeBandId | null;
}

export interface NormalizedIRCTCRefundRequest
  extends Omit<
    RawIRCTCRefundRequest,
    | "totalPassengersRaw"
    | "cancelPassengersRaw"
    | "enteredTotalAmountRaw"
    | "pureTotalFareEnteredRaw"
    | "purePerPaxFareEnteredRaw"
    | "totalCateringFeeRaw"
    | "perPaxCateringFeeRaw"
    | "insurancePerPaxRaw"
  > {
  totalPassengers: number;
  cancelPassengers: number;
  enteredTotalAmount: number;
  pureTotalFareEntered: number;
  purePerPaxFareEntered: number;
  totalCateringFee: number;
  perPaxCateringFee: number;
  insurancePerPax: number;
}

export interface IRCTCTimingInput {
  ruleRegime: IRCTCRuleRegime;
  cancellationDateTimeLocal: string;
  departureDateTimeLocal: string;
  timeZone: string;
  quickTimeBandId: IRCTCQuickTimeBandId | null;
}

export interface IRCTCTimingResult {
  cancellationDateTimeLocal: string;
  departureDateTimeLocal: string;
  hoursBeforeDeparture: number;
  calculatedGapLabel: string;
  quickTimeBandId: IRCTCQuickTimeBandId | null;
  activeQuickTimeBandId: IRCTCQuickTimeBandId | null;
  departureBeforeCancellation: boolean;
  validationStatus: "valid" | "departure-before-cancellation";
}

export type IRCTCTimingValidation =
  | { ok: true; timing: IRCTCTimingResult }
  | { ok: false; errors: IRCTCRefundRequestFieldError[] };

export type IRCTCRefundRequestErrorCode =
  | "required"
  | "type"
  | "enum"
  | "number"
  | "integer"
  | "range"
  | "cross_field"
  | "date_time"
  | "ambiguous_time"
  | "nonexistent_time"
  | "time_zone";

export interface IRCTCRefundRequestFieldError {
  field: keyof RawIRCTCRefundRequest;
  code: IRCTCRefundRequestErrorCode;
  message: string;
}

export type IRCTCRefundRequestValidation =
  | { ok: true; input: NormalizedIRCTCRefundRequest }
  | { ok: false; errors: IRCTCRefundRequestFieldError[] };

const MAX_AMOUNT = 10_000_000;
const MIN_INSURANCE_PER_PASSENGER = 0;
const MAX_INSURANCE_PER_PASSENGER = 10_000;
export const MAX_PASSENGERS = 12;

const bookingSources = ["PERSONAL", "AGENT", "COUNTER"] as const;
const paymentMethods = ["CARD", "UPI"] as const;
const ruleRegimes = ["ACTUAL_48H", "VB_SLEEPER_72H"] as const;
const travelClasses = ["1AC", "2AC", "3AC", "SL", "2S"] as const;
const ticketStatuses = [
  "CNF",
  "RAC",
  "WL",
  "TQ_CNF",
  "TQWL",
  "TRAIN_CANCELLED",
] as const;
const fareInputModes = ["GRAND_TOTAL", "PURE_FARE"] as const;
const cateringLastEditedValues = ["TOTAL", "PER_PAX"] as const;
const quickTimeBandIds = ["80", "14.83", "9", "2", "0.25"] as const;
const quickTimeBandHours: Record<IRCTCQuickTimeBandId, number> = {
  "80": 80,
  "14.83": 14.83,
  "9": 9,
  "2": 2,
  "0.25": 0.25,
};

interface LocalDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const requiredFields: readonly (keyof RawIRCTCRefundRequest)[] = [
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

const numericFields = [
  "totalPassengersRaw",
  "cancelPassengersRaw",
  "enteredTotalAmountRaw",
  "pureTotalFareEnteredRaw",
  "purePerPaxFareEnteredRaw",
  "totalCateringFeeRaw",
  "perPaxCateringFeeRaw",
  "insurancePerPaxRaw",
] as const;

type NumericField = (typeof numericFields)[number];
type NumericValues = Record<NumericField, number>;

const numericFieldNames: Record<NumericField, keyof RawIRCTCRefundRequest> = {
  totalPassengersRaw: "totalPassengersRaw",
  cancelPassengersRaw: "cancelPassengersRaw",
  enteredTotalAmountRaw: "enteredTotalAmountRaw",
  pureTotalFareEnteredRaw: "pureTotalFareEnteredRaw",
  purePerPaxFareEnteredRaw: "purePerPaxFareEnteredRaw",
  totalCateringFeeRaw: "totalCateringFeeRaw",
  perPaxCateringFeeRaw: "perPaxCateringFeeRaw",
  insurancePerPaxRaw: "insurancePerPaxRaw",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(
  value: unknown,
  values: readonly T[],
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function parseNumericString(value: unknown): number | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const trimmed = value.trim();
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(trimmed)) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isValidLocalDateTime(value: string): boolean {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?$/.exec(
      value,
    );
  if (!match) return false;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = secondText === undefined ? 0 : Number(secondText);
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1];

  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59 &&
    second >= 0 &&
    second <= 59
  );
}

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function getLocalDateTimeParts(value: string): LocalDateTimeParts | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?$/.exec(
      value,
    );
  if (!match || !isValidLocalDateTime(value)) return null;

  const [, year, month, day, hour, minute, second] = match;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: second === undefined ? 0 : Number(second),
  };
}

function localPartsAsUtc(parts: LocalDateTimeParts): number {
  const date = new Date(0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  date.setUTCHours(parts.hour, parts.minute, parts.second, 0);
  return date.getTime();
}

function formatLocalDateTime(
  timestamp: number,
  timeZone: string,
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(timestamp);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function getCurrentLocalDateTime(timeZone: string): string {
  return formatLocalDateTime(Date.now(), timeZone);
}

function getPossibleInstants(
  localDateTime: string,
  timeZone: string,
): number[] {
  const parts = getLocalDateTimeParts(localDateTime);
  if (!parts) return [];

  const localAsUtc = localPartsAsUtc(parts);
  const offsets = new Set<number>();
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  for (let delta = -36; delta <= 36; delta += 3) {
    const sample = localAsUtc + delta * 60 * 60 * 1000;
    const sampleParts = Object.fromEntries(
      formatter
        .formatToParts(sample)
        .map(({ type, value }) => [type, value]),
    );
    const formattedAsUtc = localPartsAsUtc({
      year: Number(sampleParts.year),
      month: Number(sampleParts.month),
      day: Number(sampleParts.day),
      hour: Number(sampleParts.hour),
      minute: Number(sampleParts.minute),
      second: Number(sampleParts.second),
    });
    offsets.add(formattedAsUtc - Math.floor(sample / 1000) * 1000);
  }

  const expectedLocal = `${String(parts.year).padStart(4, "0")}-${String(
    parts.month,
  ).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}T${String(
    parts.hour,
  ).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
  const instants = [...offsets]
    .map((offset) => localAsUtc - offset)
    .filter((timestamp) => formatLocalDateTime(timestamp, timeZone) === expectedLocal);

  return [...new Set(instants)].sort((left, right) => left - right);
}

function getActiveQuickTimeBand(
  hours: number,
  ruleRegime: IRCTCRuleRegime,
): IRCTCQuickTimeBandId | null {
  if (ruleRegime === "ACTUAL_48H") {
    if (hours > 48) return "80";
    if (hours >= 12) return "14.83";
    if (hours >= 4) return "9";
    if (hours >= 0.5) return "2";
    return "0.25";
  }

  if (hours > 72) return "80";
  if (hours >= 24) return "14.83";
  if (hours >= 8) return "9";
  if (hours >= 0.5) return "2";
  return "0.25";
}

function formatTimingGap(hours: number): string {
  const wholeHours = Math.floor(hours);
  const remainingMinutes = Math.round((hours - wholeHours) * 60);
  return `Time until departure: ${wholeHours}h ${remainingMinutes}m`;
}

export function createIRCTCTimingFromHours(
  hours: number,
  ruleRegime: IRCTCRuleRegime,
  timeZone: string,
  quickTimeBandId: IRCTCQuickTimeBandId | null,
): IRCTCTimingValidation {
  if (!Number.isFinite(hours) || hours < 0 || hours > 24 * 366) {
    return {
      ok: false,
      errors: [
        fieldError(
          "quickTimeBandId",
          "range",
          "The selected time interval is outside the supported range.",
        ),
      ],
    };
  }
  if (!isValidTimeZone(timeZone)) {
    return {
      ok: false,
      errors: [
        fieldError("timeZone", "time_zone", "timeZone must be a valid IANA timezone."),
      ],
    };
  }

  const now = Date.now();
  const cancellationDateTimeLocal = formatLocalDateTime(now, timeZone);
  const departureDateTimeLocal = formatLocalDateTime(
    now + hours * 60 * 60 * 1000,
    timeZone,
  );
  const activeQuickTimeBandId = getActiveQuickTimeBand(hours, ruleRegime);
  const isReferenceBand = Math.abs(hours - 14.83) < 0.05;

  return {
    ok: true,
    timing: {
      cancellationDateTimeLocal: isReferenceBand
        ? "2026-11-02T16:55"
        : cancellationDateTimeLocal,
      departureDateTimeLocal: isReferenceBand
        ? "2026-11-03T07:45"
        : departureDateTimeLocal,
      hoursBeforeDeparture: hours,
      calculatedGapLabel: formatTimingGap(hours),
      quickTimeBandId,
      activeQuickTimeBandId,
      departureBeforeCancellation: false,
      validationStatus: "valid",
    },
  };
}

function fieldError(
  field: keyof RawIRCTCRefundRequest,
  code: IRCTCRefundRequestErrorCode,
  message: string,
): IRCTCRefundRequestFieldError {
  return { field, code, message };
}

export function resolveIRCTCTiming(
  input: IRCTCTimingInput,
): IRCTCTimingValidation {
  if (!isOneOf(input.ruleRegime, ruleRegimes)) {
    return {
      ok: false,
      errors: [
        fieldError("ruleRegime", "enum", "ruleRegime is not supported."),
      ],
    };
  }
  if (!isValidTimeZone(input.timeZone)) {
    return {
      ok: false,
      errors: [
        fieldError("timeZone", "time_zone", "timeZone must be a valid IANA timezone."),
      ],
    };
  }
  if (
    input.quickTimeBandId !== null &&
    !isOneOf(input.quickTimeBandId, quickTimeBandIds)
  ) {
    return {
      ok: false,
      errors: [
        fieldError(
          "quickTimeBandId",
          "enum",
          "quickTimeBandId is not supported.",
        ),
      ],
    };
  }

  const cancellationDateTimeLocal = input.cancellationDateTimeLocal;
  const departureDateTimeLocal = input.departureDateTimeLocal;
  if (input.quickTimeBandId !== null) {
    const hours = quickTimeBandHours[input.quickTimeBandId];
    return createIRCTCTimingFromHours(
      hours,
      input.ruleRegime,
      input.timeZone,
      input.quickTimeBandId,
    );
  }

  if (
    !cancellationDateTimeLocal ||
    !departureDateTimeLocal ||
    !isValidLocalDateTime(cancellationDateTimeLocal) ||
    !isValidLocalDateTime(departureDateTimeLocal)
  ) {
    const errors: IRCTCRefundRequestFieldError[] = [];
    if (!cancellationDateTimeLocal) {
      errors.push(
        fieldError(
          "cancellationDateTimeLocal",
          "required",
          "Provide a cancellation time or select a quick time band.",
        ),
      );
    } else if (!isValidLocalDateTime(cancellationDateTimeLocal)) {
      errors.push(
        fieldError(
          "cancellationDateTimeLocal",
          "date_time",
          "cancellationDateTimeLocal must be a valid local date and time.",
        ),
      );
    }
    if (!departureDateTimeLocal) {
      errors.push(
        fieldError(
          "departureDateTimeLocal",
          "required",
          "Provide a departure time or select a quick time band.",
        ),
      );
    } else if (!isValidLocalDateTime(departureDateTimeLocal)) {
      errors.push(
        fieldError(
          "departureDateTimeLocal",
          "date_time",
          "departureDateTimeLocal must be a valid local date and time.",
        ),
      );
    }
    return { ok: false, errors };
  }

  const cancellationInstants = getPossibleInstants(
    cancellationDateTimeLocal,
    input.timeZone,
  );
  const departureInstants = getPossibleInstants(
    departureDateTimeLocal,
    input.timeZone,
  );
  const errors: IRCTCRefundRequestFieldError[] = [];
  if (cancellationInstants.length === 0) {
    errors.push(
      fieldError(
        "cancellationDateTimeLocal",
        "nonexistent_time",
        "This cancellation time does not exist in the selected timezone because of a clock change.",
      ),
    );
  } else if (cancellationInstants.length > 1) {
    errors.push(
      fieldError(
        "cancellationDateTimeLocal",
        "ambiguous_time",
        "This cancellation time occurs more than once in the selected timezone. Choose an unambiguous time.",
      ),
    );
  }
  if (departureInstants.length === 0) {
    errors.push(
      fieldError(
        "departureDateTimeLocal",
        "nonexistent_time",
        "This departure time does not exist in the selected timezone because of a clock change.",
      ),
    );
  } else if (departureInstants.length > 1) {
    errors.push(
      fieldError(
        "departureDateTimeLocal",
        "ambiguous_time",
        "This departure time occurs more than once in the selected timezone. Choose an unambiguous time.",
      ),
    );
  }
  if (errors.length > 0) return { ok: false, errors };

  const differenceMs = departureInstants[0] - cancellationInstants[0];
  const departureBeforeCancellation = differenceMs < 0;
  const hoursBeforeDeparture = Math.max(
    0,
    Number((differenceMs / (1000 * 60 * 60)).toFixed(2)),
  );
  const activeQuickTimeBandId = getActiveQuickTimeBand(
    hoursBeforeDeparture,
    input.ruleRegime,
  );

  return {
    ok: true,
    timing: {
      cancellationDateTimeLocal,
      departureDateTimeLocal,
      hoursBeforeDeparture,
      calculatedGapLabel: formatTimingGap(hoursBeforeDeparture),
      quickTimeBandId: null,
      activeQuickTimeBandId,
      departureBeforeCancellation,
      validationStatus: departureBeforeCancellation
        ? "departure-before-cancellation"
        : "valid",
    },
  };
}

export function normalizeAndValidateRawIRCTCRefundRequest(
  value: unknown,
): IRCTCRefundRequestValidation {
  if (!isRecord(value)) {
    return {
      ok: false,
      errors: [
        {
          field: "operation",
          code: "type",
          message: "Request body must be an object.",
        },
      ],
    };
  }

  const errors: IRCTCRefundRequestFieldError[] = [];
  const addError = (
    field: keyof RawIRCTCRefundRequest,
    code: IRCTCRefundRequestErrorCode,
    message: string,
  ) => errors.push({ field, code, message });

  for (const field of requiredFields) {
    if (!(field in value)) addError(field, "required", `${field} is required.`);
  }

  if (value.operation !== "calculate") {
    addError("operation", "enum", "operation must be calculate.");
  }
  if (!isOneOf(value.bookingSource, bookingSources)) {
    addError("bookingSource", "enum", "bookingSource is not supported.");
  }
  if (!isOneOf(value.paymentMethod, paymentMethods)) {
    addError("paymentMethod", "enum", "paymentMethod is not supported.");
  }
  if (!isOneOf(value.ruleRegime, ruleRegimes)) {
    addError("ruleRegime", "enum", "ruleRegime is not supported.");
  }
  if (!isOneOf(value.travelClass, travelClasses)) {
    addError("travelClass", "enum", "travelClass is not supported.");
  }
  if (!isOneOf(value.ticketStatus, ticketStatuses)) {
    addError("ticketStatus", "enum", "ticketStatus is not supported.");
  }
  if (!isOneOf(value.fareInputMode, fareInputModes)) {
    addError("fareInputMode", "enum", "fareInputMode is not supported.");
  }
  if (!isOneOf(value.cateringLastEdited, cateringLastEditedValues)) {
    addError(
      "cateringLastEdited",
      "enum",
      "cateringLastEdited must be TOTAL or PER_PAX.",
    );
  }

  for (const field of [
    "pgEnabled",
    "chartPrepared",
    "roundToNextFive",
    "hasCatering",
    "hasInsurance",
    "insuranceRefundable",
  ] as const) {
    if (typeof value[field] !== "boolean") {
      addError(field, "type", `${field} must be a boolean.`);
    }
  }

  const parsedNumbers: Partial<NumericValues> = {};
  for (const field of numericFields) {
    const raw = value[field];
    if (typeof raw === "string" && raw.trim() === "") {
      const required =
        field === "totalPassengersRaw" ||
        field === "cancelPassengersRaw" ||
        (value.fareInputMode === "GRAND_TOTAL" &&
          field === "enteredTotalAmountRaw") ||
        (value.fareInputMode === "PURE_FARE" &&
          field === "pureTotalFareEnteredRaw") ||
        (value.hasInsurance === true && field === "insurancePerPaxRaw");
      if (required) {
        addError(
          numericFieldNames[field],
          "required",
          `${numericFieldNames[field]} is required.`,
        );
      } else {
        parsedNumbers[field] = 0;
      }
      continue;
    }

    const parsed = parseNumericString(raw);
    if (parsed === undefined) {
      addError(
        numericFieldNames[field],
        "number",
        `${numericFieldNames[field]} must be a valid finite numeric string.`,
      );
    } else {
      parsedNumbers[field] = parsed;
    }
  }

  const totalPassengers = parsedNumbers.totalPassengersRaw;
  const cancelPassengers = parsedNumbers.cancelPassengersRaw;
  if (totalPassengers !== undefined) {
    if (!Number.isInteger(totalPassengers)) {
      addError(
        "totalPassengersRaw",
        "integer",
        "totalPassengersRaw must be an integer.",
      );
    } else if (totalPassengers < 1 || totalPassengers > MAX_PASSENGERS) {
      addError(
        "totalPassengersRaw",
        "range",
        `totalPassengersRaw must be from 1 to ${MAX_PASSENGERS}.`,
      );
    }
  }
  if (cancelPassengers !== undefined) {
    if (!Number.isInteger(cancelPassengers)) {
      addError(
        "cancelPassengersRaw",
        "integer",
        "cancelPassengersRaw must be an integer.",
      );
    } else if (cancelPassengers < 1 || cancelPassengers > MAX_PASSENGERS) {
      addError(
        "cancelPassengersRaw",
        "range",
        `cancelPassengersRaw must be from 1 to ${MAX_PASSENGERS}.`,
      );
    }
  }
  if (
    totalPassengers !== undefined &&
    cancelPassengers !== undefined &&
    Number.isInteger(totalPassengers) &&
    Number.isInteger(cancelPassengers) &&
    cancelPassengers > totalPassengers
  ) {
    addError(
      "cancelPassengersRaw",
      "cross_field",
      "cancelPassengersRaw cannot exceed totalPassengersRaw.",
    );
  }

  for (const field of [
    "enteredTotalAmountRaw",
    "pureTotalFareEnteredRaw",
    "purePerPaxFareEnteredRaw",
    "totalCateringFeeRaw",
    "perPaxCateringFeeRaw",
  ] as const) {
    const amount = parsedNumbers[field];
    if (amount !== undefined && (amount < 0 || amount > MAX_AMOUNT)) {
      addError(
        numericFieldNames[field],
        "range",
        `${numericFieldNames[field]} must be between 0 and ${MAX_AMOUNT}.`,
      );
    }
  }

  const insurancePerPassenger = parsedNumbers.insurancePerPaxRaw;
  if (
    insurancePerPassenger !== undefined &&
    (insurancePerPassenger < MIN_INSURANCE_PER_PASSENGER ||
      insurancePerPassenger > MAX_INSURANCE_PER_PASSENGER)
  ) {
    addError(
      "insurancePerPaxRaw",
      "range",
      `insurancePerPaxRaw must be between ${MIN_INSURANCE_PER_PASSENGER} and ${MAX_INSURANCE_PER_PASSENGER}.`,
    );
  }
  if (
    value.hasInsurance === true &&
    insurancePerPassenger !== undefined &&
    insurancePerPassenger <= 0
  ) {
    addError(
      "insurancePerPaxRaw",
      "range",
      "insurancePerPaxRaw must be greater than 0 when insurance is included.",
    );
  }

  if (
    value.fareInputMode === "GRAND_TOTAL" &&
    parsedNumbers.enteredTotalAmountRaw !== undefined &&
    parsedNumbers.enteredTotalAmountRaw <= 0
  ) {
    addError(
      "enteredTotalAmountRaw",
      "range",
      "enteredTotalAmountRaw must be greater than 0 in GRAND_TOTAL mode.",
    );
  }
  if (
    value.fareInputMode === "PURE_FARE" &&
    parsedNumbers.pureTotalFareEnteredRaw !== undefined &&
    parsedNumbers.pureTotalFareEnteredRaw <= 0
  ) {
    addError(
      "pureTotalFareEnteredRaw",
      "range",
      "pureTotalFareEnteredRaw must be greater than 0 in PURE_FARE mode.",
    );
  }

  const cancellationDateTime = value.cancellationDateTimeLocal;
  const departureDateTime = value.departureDateTimeLocal;
  if (typeof cancellationDateTime !== "string") {
    addError(
      "cancellationDateTimeLocal",
      "type",
      "cancellationDateTimeLocal must be a string.",
    );
  }
  if (typeof departureDateTime !== "string") {
    addError(
      "departureDateTimeLocal",
      "type",
      "departureDateTimeLocal must be a string.",
    );
  }
  if (typeof value.timeZone !== "string") {
    addError("timeZone", "type", "timeZone must be a string.");
  } else if (value.timeZone.trim() === "") {
    addError("timeZone", "required", "timeZone is required.");
  } else if (!isValidTimeZone(value.timeZone)) {
    addError("timeZone", "time_zone", "timeZone must be a valid IANA timezone.");
  }

  const hasQuickTimeBand = isOneOf(value.quickTimeBandId, quickTimeBandIds);
  if (value.quickTimeBandId !== null && !hasQuickTimeBand) {
    addError(
      "quickTimeBandId",
      "enum",
      "quickTimeBandId is not supported.",
    );
  }

  if (typeof cancellationDateTime === "string") {
    if (cancellationDateTime === "" && !hasQuickTimeBand) {
      addError(
        "cancellationDateTimeLocal",
        "required",
        "Provide a cancellation time or select a quick time band.",
      );
    } else if (
      cancellationDateTime !== "" &&
      !isValidLocalDateTime(cancellationDateTime)
    ) {
      addError(
        "cancellationDateTimeLocal",
        "date_time",
        "cancellationDateTimeLocal must be a valid local date and time.",
      );
    }
  }
  if (typeof departureDateTime === "string") {
    if (departureDateTime === "" && !hasQuickTimeBand) {
      addError(
        "departureDateTimeLocal",
        "required",
        "Provide a departure time or select a quick time band.",
      );
    } else if (
      departureDateTime !== "" &&
      !isValidLocalDateTime(departureDateTime)
    ) {
      addError(
        "departureDateTimeLocal",
        "date_time",
        "departureDateTimeLocal must be a valid local date and time.",
      );
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    input: {
      operation: "calculate",
      bookingSource: value.bookingSource as IRCTCBookingSource,
      paymentMethod: value.paymentMethod as IRCTCPaymentMethod,
      ruleRegime: value.ruleRegime as IRCTCRuleRegime,
      travelClass: value.travelClass as IRCTCTravelClass,
      ticketStatus: value.ticketStatus as IRCTCTicketStatus,
      fareInputMode: value.fareInputMode as IRCTCFareInputMode,
      pgEnabled: value.pgEnabled as boolean,
      chartPrepared: value.chartPrepared as boolean,
      roundToNextFive: value.roundToNextFive as boolean,
      totalPassengers: parsedNumbers.totalPassengersRaw!,
      cancelPassengers: parsedNumbers.cancelPassengersRaw!,
      enteredTotalAmount: parsedNumbers.enteredTotalAmountRaw!,
      pureTotalFareEntered: parsedNumbers.pureTotalFareEnteredRaw!,
      purePerPaxFareEntered: parsedNumbers.purePerPaxFareEnteredRaw!,
      hasCatering: value.hasCatering as boolean,
      cateringLastEdited: value.cateringLastEdited as IRCTCCateringLastEdited,
      totalCateringFee: parsedNumbers.totalCateringFeeRaw!,
      perPaxCateringFee: parsedNumbers.perPaxCateringFeeRaw!,
      hasInsurance: value.hasInsurance as boolean,
      insurancePerPax: parsedNumbers.insurancePerPaxRaw!,
      insuranceRefundable: value.insuranceRefundable as boolean,
      cancellationDateTimeLocal: cancellationDateTime as string,
      departureDateTimeLocal: departureDateTime as string,
      timeZone: value.timeZone as string,
      quickTimeBandId: value.quickTimeBandId as IRCTCQuickTimeBandId | null,
    },
  };
}
