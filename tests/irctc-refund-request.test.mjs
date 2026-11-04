import assert from "node:assert/strict";
import test from "node:test";

import {
  createIRCTCTimingFromHours,
  normalizeAndValidateRawIRCTCRefundRequest,
  resolveIRCTCTiming,
} from "../src/lib/server/irctc-refund-request.ts";

const validRequest = {
  operation: "calculate",
  bookingSource: "AGENT",
  paymentMethod: "CARD",
  ruleRegime: "ACTUAL_48H",
  travelClass: "3AC",
  ticketStatus: "CNF",
  fareInputMode: "GRAND_TOTAL",
  pgEnabled: true,
  chartPrepared: false,
  roundToNextFive: true,
  totalPassengersRaw: "2",
  cancelPassengersRaw: "1",
  enteredTotalAmountRaw: "1481.13",
  pureTotalFareEnteredRaw: "1032",
  purePerPaxFareEnteredRaw: "516",
  hasCatering: true,
  cateringLastEdited: "TOTAL",
  totalCateringFeeRaw: "363",
  perPaxCateringFeeRaw: "181.5",
  hasInsurance: false,
  insurancePerPaxRaw: "0.45",
  insuranceRefundable: true,
  cancellationDateTimeLocal: "2026-11-02T16:55",
  departureDateTimeLocal: "2026-11-03T07:45",
  timeZone: "Asia/Kolkata",
  quickTimeBandId: null,
};

function errorFor(request, field, code) {
  const result = normalizeAndValidateRawIRCTCRefundRequest(request);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.field === field && error.code === code));
}

test("normalizes valid numeric strings and preserves non-derived raw selections", () => {
  const result = normalizeAndValidateRawIRCTCRefundRequest(validRequest);

  assert.equal(result.ok, true);
  assert.equal(result.input.totalPassengers, 2);
  assert.equal(result.input.cancelPassengers, 1);
  assert.equal(result.input.enteredTotalAmount, 1481.13);
  assert.equal(result.input.totalCateringFee, 363);
  assert.equal(result.input.perPaxCateringFee, 181.5);
  assert.equal(result.input.cateringLastEdited, "TOTAL");
  assert.equal(result.input.cancellationDateTimeLocal, "2026-11-02T16:55");
  assert.equal(result.input.departureDateTimeLocal, "2026-11-03T07:45");
  assert.equal(result.input.quickTimeBandId, null);
});

test("reports each missing required field with a stable required code", () => {
  for (const field of Object.keys(validRequest)) {
    const missingRequest = { ...validRequest };
    delete missingRequest[field];

    const result = normalizeAndValidateRawIRCTCRefundRequest(missingRequest);

    assert.equal(result.ok, false, `${field} should be required`);
    assert.ok(
      result.errors.some((error) => error.field === field && error.code === "required"),
      `${field} should have a required error`,
    );
  }
});

test("rejects blank and malformed numeric strings without converting them to zero", () => {
  errorFor({ ...validRequest, totalPassengersRaw: "" }, "totalPassengersRaw", "required");
  errorFor({ ...validRequest, cancelPassengersRaw: "" }, "cancelPassengersRaw", "required");
  errorFor({ ...validRequest, enteredTotalAmountRaw: "1,200" }, "enteredTotalAmountRaw", "number");
  errorFor({ ...validRequest, pureTotalFareEnteredRaw: "not-a-number" }, "pureTotalFareEnteredRaw", "number");
});

test("rejects NaN, Infinity, and numeric overflow strings", () => {
  errorFor({ ...validRequest, totalPassengersRaw: "NaN" }, "totalPassengersRaw", "number");
  for (const value of ["NaN", "Infinity", "-Infinity", "1e999"]) {
    errorFor({ ...validRequest, totalCateringFeeRaw: value }, "totalCateringFeeRaw", "number");
  }
});

test("rejects negative monetary values", () => {
  errorFor({ ...validRequest, enteredTotalAmountRaw: "-0.01" }, "enteredTotalAmountRaw", "range");
  errorFor({ ...validRequest, totalCateringFeeRaw: "-1" }, "totalCateringFeeRaw", "range");
  errorFor({ ...validRequest, insurancePerPaxRaw: "-0.1" }, "insurancePerPaxRaw", "range");
});

test("enforces integer passenger counts and the existing 1 to 12 range", () => {
  errorFor({ ...validRequest, totalPassengersRaw: "1.5" }, "totalPassengersRaw", "integer");
  errorFor({ ...validRequest, cancelPassengersRaw: "2.5" }, "cancelPassengersRaw", "integer");
  errorFor({ ...validRequest, totalPassengersRaw: "0" }, "totalPassengersRaw", "range");
  errorFor({ ...validRequest, totalPassengersRaw: "13" }, "totalPassengersRaw", "range");

  const maximum = normalizeAndValidateRawIRCTCRefundRequest({
    ...validRequest,
    totalPassengersRaw: "1",
    cancelPassengersRaw: "1",
  });
  assert.equal(maximum.ok, true);
  const maximumCount = normalizeAndValidateRawIRCTCRefundRequest({
    ...validRequest,
    totalPassengersRaw: "12",
    cancelPassengersRaw: "12",
  });
  assert.equal(maximumCount.ok, true);
});

test("rejects cancelling more passengers than are on the booking", () => {
  errorFor(
    { ...validRequest, totalPassengersRaw: "1", cancelPassengersRaw: "2" },
    "cancelPassengersRaw",
    "cross_field",
  );
});

test("enforces the existing fare, catering, and insurance limits", () => {
  errorFor(
    { ...validRequest, enteredTotalAmountRaw: "10000001" },
    "enteredTotalAmountRaw",
    "range",
  );
  errorFor(
    { ...validRequest, pureTotalFareEnteredRaw: "10000001" },
    "pureTotalFareEnteredRaw",
    "range",
  );
  errorFor(
    { ...validRequest, purePerPaxFareEnteredRaw: "10000001" },
    "purePerPaxFareEnteredRaw",
    "range",
  );
  errorFor(
    { ...validRequest, totalCateringFeeRaw: "10000001" },
    "totalCateringFeeRaw",
    "range",
  );
  errorFor(
    { ...validRequest, perPaxCateringFeeRaw: "10000001" },
    "perPaxCateringFeeRaw",
    "range",
  );
  errorFor(
    { ...validRequest, insurancePerPaxRaw: "10001" },
    "insurancePerPaxRaw",
    "range",
  );
});

test("requires a positive active fare and positive insurance rate when included", () => {
  errorFor(
    { ...validRequest, enteredTotalAmountRaw: "0" },
    "enteredTotalAmountRaw",
    "range",
  );
  errorFor(
    { ...validRequest, hasInsurance: true, insurancePerPaxRaw: "0" },
    "insurancePerPaxRaw",
    "range",
  );
});

test("rejects unsupported enum values", () => {
  errorFor({ ...validRequest, operation: "preview" }, "operation", "enum");
  errorFor({ ...validRequest, bookingSource: "UNKNOWN" }, "bookingSource", "enum");
  errorFor({ ...validRequest, ticketStatus: "UNKNOWN" }, "ticketStatus", "enum");
  errorFor({ ...validRequest, cateringLastEdited: "UNKNOWN" }, "cateringLastEdited", "enum");
});

test("validates local date/time syntax and calendar values without deriving a gap", () => {
  errorFor(
    { ...validRequest, cancellationDateTimeLocal: "2026-02-29T16:55" },
    "cancellationDateTimeLocal",
    "date_time",
  );
  errorFor(
    { ...validRequest, departureDateTimeLocal: "2026-11-03 07:45" },
    "departureDateTimeLocal",
    "date_time",
  );

  const quickBandRequest = normalizeAndValidateRawIRCTCRefundRequest({
    ...validRequest,
    cancellationDateTimeLocal: "",
    departureDateTimeLocal: "",
    quickTimeBandId: "14.83",
  });
  assert.equal(quickBandRequest.ok, true);
  if (quickBandRequest.ok) {
    assert.equal(quickBandRequest.input.cancellationDateTimeLocal, "");
    assert.equal(quickBandRequest.input.quickTimeBandId, "14.83");
  }
  const validLeapDay = normalizeAndValidateRawIRCTCRefundRequest({
    ...validRequest,
    cancellationDateTimeLocal: "2024-02-29T16:55",
  });
  assert.equal(validLeapDay.ok, true);
});

test("requires both date/time values or a supported quick time band", () => {
  errorFor(
    {
      ...validRequest,
      cancellationDateTimeLocal: "",
      departureDateTimeLocal: "",
    },
    "cancellationDateTimeLocal",
    "required",
  );
  errorFor(
    {
      ...validRequest,
      cancellationDateTimeLocal: "",
      departureDateTimeLocal: "",
      quickTimeBandId: "not-a-band",
    },
    "quickTimeBandId",
    "enum",
  );
});

test("requires a valid IANA timezone", () => {
  errorFor({ ...validRequest, timeZone: "" }, "timeZone", "required");
  errorFor({ ...validRequest, timeZone: "Not/A_Timezone" }, "timeZone", "time_zone");
});

test("preserves the reference 14.83-hour time band and its local datetime values", () => {
  const result = createIRCTCTimingFromHours(
    14.83,
    "ACTUAL_48H",
    "Asia/Kolkata",
    "14.83",
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.timing.hoursBeforeDeparture, 14.83);
    assert.equal(result.timing.cancellationDateTimeLocal, "2026-11-02T16:55");
    assert.equal(result.timing.departureDateTimeLocal, "2026-11-03T07:45");
    assert.equal(result.timing.activeQuickTimeBandId, "14.83");
  }
});

test("maps each quick time band to its existing hour value", () => {
  for (const [id, hours] of [
    ["80", 80],
    ["14.83", 14.83],
    ["9", 9],
    ["2", 2],
    ["0.25", 0.25],
  ]) {
    const result = resolveIRCTCTiming({
      ruleRegime: "ACTUAL_48H",
      cancellationDateTimeLocal: "",
      departureDateTimeLocal: "",
      timeZone: "Asia/Kolkata",
      quickTimeBandId: id,
    });
    assert.equal(result.ok, true, `band ${id} should resolve`);
    if (result.ok) {
      assert.equal(result.timing.hoursBeforeDeparture, hours);
      assert.equal(result.timing.quickTimeBandId, id);
    }
  }
});

test("matches the existing regular and sleeper time-band boundaries", () => {
  const regularBoundaries = [
    [48.01, "80"],
    [48, "14.83"],
    [12, "14.83"],
    [11.99, "9"],
    [4, "9"],
    [3.99, "2"],
    [0.5, "2"],
    [0.49, "0.25"],
  ];
  for (const [hours, expected] of regularBoundaries) {
    const result = createIRCTCTimingFromHours(hours, "ACTUAL_48H", "UTC", null);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.timing.activeQuickTimeBandId, expected);
  }

  const sleeperBoundaries = [
    [72.01, "80"],
    [72, "14.83"],
    [24, "14.83"],
    [23.99, "9"],
    [8, "9"],
    [7.99, "2"],
    [0.5, "2"],
    [0.49, "0.25"],
  ];
  for (const [hours, expected] of sleeperBoundaries) {
    const result = createIRCTCTimingFromHours(
      hours,
      "VB_SLEEPER_72H",
      "UTC",
      null,
    );
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.timing.activeQuickTimeBandId, expected);
  }
});

test("computes timezone-aware offsets, midnight crossing, and two-decimal rounding", () => {
  const india = resolveIRCTCTiming({
    ruleRegime: "ACTUAL_48H",
    cancellationDateTimeLocal: "2026-11-02T16:55",
    departureDateTimeLocal: "2026-11-03T07:45",
    timeZone: "Asia/Kolkata",
    quickTimeBandId: null,
  });
  assert.equal(india.ok, true);
  if (india.ok) assert.equal(india.timing.hoursBeforeDeparture, 14.83);

  const utcMidnight = resolveIRCTCTiming({
    ruleRegime: "ACTUAL_48H",
    cancellationDateTimeLocal: "2026-01-01T23:00",
    departureDateTimeLocal: "2026-01-02T01:00",
    timeZone: "UTC",
    quickTimeBandId: null,
  });
  assert.equal(utcMidnight.ok, true);
  if (utcMidnight.ok) assert.equal(utcMidnight.timing.hoursBeforeDeparture, 2);

  const newYorkOffset = resolveIRCTCTiming({
    ruleRegime: "ACTUAL_48H",
    cancellationDateTimeLocal: "2026-01-01T12:00",
    departureDateTimeLocal: "2026-01-01T13:00",
    timeZone: "America/New_York",
    quickTimeBandId: null,
  });
  assert.equal(newYorkOffset.ok, true);
  if (newYorkOffset.ok) assert.equal(newYorkOffset.timing.hoursBeforeDeparture, 1);
});

test("uses elapsed time across DST and rejects ambiguous or nonexistent local times", () => {
  const acrossSpringForward = resolveIRCTCTiming({
    ruleRegime: "ACTUAL_48H",
    cancellationDateTimeLocal: "2026-03-08T01:30",
    departureDateTimeLocal: "2026-03-08T03:30",
    timeZone: "America/New_York",
    quickTimeBandId: null,
  });
  assert.equal(acrossSpringForward.ok, true);
  if (acrossSpringForward.ok) {
    assert.equal(acrossSpringForward.timing.hoursBeforeDeparture, 1);
  }

  const nonexistent = resolveIRCTCTiming({
    ruleRegime: "ACTUAL_48H",
    cancellationDateTimeLocal: "2026-03-08T01:30",
    departureDateTimeLocal: "2026-03-08T02:30",
    timeZone: "America/New_York",
    quickTimeBandId: null,
  });
  assert.equal(nonexistent.ok, false);
  if (!nonexistent.ok) {
    assert.ok(nonexistent.errors.some((error) => error.code === "nonexistent_time"));
  }

  const ambiguous = resolveIRCTCTiming({
    ruleRegime: "ACTUAL_48H",
    cancellationDateTimeLocal: "2026-11-01T01:30",
    departureDateTimeLocal: "2026-11-01T02:30",
    timeZone: "America/New_York",
    quickTimeBandId: null,
  });
  assert.equal(ambiguous.ok, false);
  if (!ambiguous.ok) {
    assert.ok(ambiguous.errors.some((error) => error.code === "ambiguous_time"));
  }
});

test("preserves the established negative-gap clamp and same-time behavior", () => {
  const negative = resolveIRCTCTiming({
    ruleRegime: "ACTUAL_48H",
    cancellationDateTimeLocal: "2026-11-03T08:00",
    departureDateTimeLocal: "2026-11-03T07:45",
    timeZone: "Asia/Kolkata",
    quickTimeBandId: null,
  });
  assert.equal(negative.ok, true);
  if (negative.ok) {
    assert.equal(negative.timing.hoursBeforeDeparture, 0);
    assert.equal(negative.timing.departureBeforeCancellation, true);
    assert.equal(
      negative.timing.validationStatus,
      "departure-before-cancellation",
    );
  }

  const sameTime = resolveIRCTCTiming({
    ruleRegime: "ACTUAL_48H",
    cancellationDateTimeLocal: "2026-11-03T07:45",
    departureDateTimeLocal: "2026-11-03T07:45",
    timeZone: "Asia/Kolkata",
    quickTimeBandId: null,
  });
  assert.equal(sameTime.ok, true);
  if (sameTime.ok) {
    assert.equal(sameTime.timing.hoursBeforeDeparture, 0);
    assert.equal(sameTime.timing.departureBeforeCancellation, false);
    assert.equal(sameTime.timing.validationStatus, "valid");
  }
});

test("rejects missing datetimes and invalid timezones in timing resolution", () => {
  const missing = resolveIRCTCTiming({
    ruleRegime: "ACTUAL_48H",
    cancellationDateTimeLocal: "",
    departureDateTimeLocal: "",
    timeZone: "UTC",
    quickTimeBandId: null,
  });
  assert.equal(missing.ok, false);
  if (!missing.ok) {
    assert.ok(missing.errors.some((error) => error.field === "cancellationDateTimeLocal"));
    assert.ok(missing.errors.some((error) => error.field === "departureDateTimeLocal"));
  }

  const invalid = resolveIRCTCTiming({
    ruleRegime: "ACTUAL_48H",
    cancellationDateTimeLocal: validRequest.cancellationDateTimeLocal,
    departureDateTimeLocal: validRequest.departureDateTimeLocal,
    timeZone: "Not/A_Timezone",
    quickTimeBandId: null,
  });
  assert.equal(invalid.ok, false);
  if (!invalid.ok) {
    assert.ok(invalid.errors.some((error) => error.code === "time_zone"));
  }
});
