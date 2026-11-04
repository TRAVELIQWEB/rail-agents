import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  calculateIRCTCWorkflow,
  getIRCTCCalculatorMetadata,
  normalizeIRCTCFormState,
  resolveIRCTCScenario,
} from "../src/lib/server/irctc-refund-workflow.ts";

const fixture = JSON.parse(
  readFileSync(
    new URL("./fixtures/irctc-refund-baseline.json", import.meta.url),
    "utf8",
  ),
);

function requestForCase(testCase) {
  const input = testCase.input;
  const captured = testCase.capturedReferenceInputs ?? {};
  const value = (capturedValue, inputValue, fallback = 0) =>
    String(capturedValue ?? inputValue ?? fallback);
  return {
    operation: "calculate",
    bookingSource: input.source,
    paymentMethod: input.payment,
    ruleRegime: input.regime === "SLEEPER" ? "VB_SLEEPER_72H" : "ACTUAL_48H",
    travelClass: input.cls,
    ticketStatus: input.status,
    fareInputMode: input.fareMode,
    pgEnabled: input.pg,
    chartPrepared: input.chart,
    roundToNextFive: input.round,
    totalPassengersRaw: value(captured.totalPassengersInput, input.totalPax),
    cancelPassengersRaw: value(captured.cancelPassengersInput, input.cancelPax),
    enteredTotalAmountRaw: value(captured.enteredGrandTotalInput, input.paid),
    pureTotalFareEnteredRaw: value(captured.pureTotalFareInput, input.railFare),
    purePerPaxFareEnteredRaw: value(
      captured.purePerPaxFareInput,
      input.purePerPaxFare,
      input.railFare / input.totalPax,
    ),
    hasCatering: input.catering > 0,
    cateringLastEdited: "TOTAL",
    totalCateringFeeRaw: value(captured.totalCateringInput, input.catering),
    perPaxCateringFeeRaw: value(
      captured.perPaxCateringInput,
      input.catering / input.totalPax,
    ),
    hasInsurance: input.insurance > 0,
    insurancePerPaxRaw: value(captured.customInsRateInput, input.insurance, 0.45),
    insuranceRefundable:
      captured.insRefundableCheckbox ?? input.insuranceRefundable,
    cancellationDateTimeLocal: captured.cancelDateTime ?? "2026-11-02T16:55",
    departureDateTimeLocal: captured.departureDateTime ?? "2026-11-03T07:45",
    timeZone: "Asia/Kolkata",
    quickTimeBandId: null,
  };
}

const financialDisplayFields = [
  "finalNetRefundDisplay",
  "finalRailwayCutDisplay",
  "receiptGrandTotalPaid",
  "receiptIrctcFee",
  "receiptInsuranceFee",
  "receiptPgBaseVal",
  "receiptPgSlabLabel",
  "receiptPgFee",
  "receiptAgentFee",
  "receiptPureRailwayTotal",
  "receiptPerPaxFormulaBadge",
  "receiptCancelPaxCount",
  "receiptCancellingTrainFare",
  "receiptCancellingCatering",
  "receiptExGstBaseVal",
  "receiptBaseCancelCut",
  "receiptGstCancelCut",
  "receiptRoundingCut",
  "receiptTotalRailwayCut",
  "receiptNetTrainRefund",
  "receiptNetFoodRefund",
  "receiptNetInsRefund",
  "receiptFinalBankRefund",
];

function assertFinancialDisplayMatches(testCase) {
  const result = calculateIRCTCWorkflow(requestForCase(testCase));
  assert.equal(result.ok, true, `${testCase.id}: ${JSON.stringify(result)}`);
  assert.deepEqual(Object.keys(result.response), ["result"]);
  assert.deepEqual(Object.keys(result.response.result), [
    "display",
    "visibility",
    "alertTone",
    "timing",
  ]);
  const expected =
    testCase.implementationOutputs ?? testCase.expectedOutputs;
  const hiddenRows = {
    receiptInsuranceFee: "receiptInsuranceRow",
    receiptPgBaseVal: "receiptPgBaseRow",
    receiptPgSlabLabel: "receiptPgBaseRow",
    receiptPgFee: "receiptPgFeeRow",
    receiptAgentFee: "receiptAgentFeeRow",
    receiptNetInsRefund: "receiptNetInsRefundRow",
  };
  for (const field of financialDisplayFields) {
    if (!(field in expected)) continue;
    const hiddenRow = hiddenRows[field];
    if (hiddenRow && result.response.result.visibility[hiddenRow] === false) {
      continue;
    }
    assert.equal(
      result.response.result.display[field],
      expected[field],
      `${testCase.id}: ${field}`,
    );
  }
}

test("metadata exposes server-controlled UI options and no calculation internals", () => {
  const metadata = getIRCTCCalculatorMetadata();

  assert.deepEqual(metadata.timeBands.map(({ id }) => id), [
    "80",
    "14.83",
    "9",
    "2",
    "0.25",
  ]);
  assert.equal(metadata.scenarios.length, 7);
  assert.equal(metadata.initialState.cateringLastEdited, "TOTAL");
  assert.equal("calculation" in metadata, false);
});

test("normalizes passenger, fare, catering and insurance controls on the server", () => {
  let state = getIRCTCCalculatorMetadata().initialState;
  const update = (changedField, presetId = null) => {
    const result = normalizeIRCTCFormState({
      state,
      changedField,
      presetId,
    });
    assert.equal(result.ok, true, JSON.stringify(result));
    state = result.response.state;
    return result.response.summary;
  };

  state.totalPassengersRaw = "3";
  state.cancelPassengersRaw = "2";
  let summary = update("totalPassengersRaw");
  assert.equal(state.totalPassengersRaw, "3");
  assert.deepEqual(summary.disabledCancelPassengerOptions, ["4", "5", "6"]);
  state.cancelPassengersRaw = "4";
  update("cancelPassengersRaw");
  assert.equal(state.cancelPassengersRaw, "3");

  state.fareInputMode = "PURE_FARE";
  state.purePerPaxFareEnteredRaw = "101.235";
  update("purePerPaxFareEnteredRaw");
  assert.equal(state.pureTotalFareEnteredRaw, "303.7");

  update("cateringPreset", "vandeBharat");
  assert.equal(state.cateringLastEdited, "TOTAL");
  assert.equal(state.totalCateringFeeRaw, "1089");
  assert.equal(state.perPaxCateringFeeRaw, "363");

  update("insurancePreset", "reduced");
  assert.equal(state.insurancePerPaxRaw, "0.35");
  assert.equal(state.hasInsurance, true);

  const toggled = normalizeIRCTCFormState({
    state,
    changedField: "togglePgEnabled",
    presetId: null,
  });
  assert.equal(toggled.ok, true);
  assert.equal(toggled.response.state.pgEnabled, false);
});

test("rejects malformed state and unknown presets with stable field errors", () => {
  const state = getIRCTCCalculatorMetadata().initialState;
  const invalidEnum = normalizeIRCTCFormState({
    state: { ...state, ticketStatus: "NOT_A_STATUS" },
    changedField: "ticketStatus",
    presetId: null,
  });
  assert.equal(invalidEnum.ok, false);
  assert.ok(invalidEnum.errors.some((error) => error.field === "ticketStatus"));

  const invalidPreset = normalizeIRCTCFormState({
    state,
    changedField: "cateringPreset",
    presetId: "unknown",
  });
  assert.equal(invalidPreset.ok, false);
  assert.ok(invalidPreset.errors.some((error) => error.field === "presetId"));
});

test("keeps blank and malformed passenger strings for calculation validation", () => {
  const state = getIRCTCCalculatorMetadata().initialState;
  for (const raw of ["", "NaN", "1.5"]) {
    const result = normalizeIRCTCFormState({
      state: { ...state, totalPassengersRaw: raw },
      changedField: "totalPassengersRaw",
      presetId: null,
    });
    assert.equal(result.ok, true);
    assert.equal(result.response.state.totalPassengersRaw, raw);
  }
});

test("resolves built-in scenarios with backend-controlled timing and state", () => {
  const result = resolveIRCTCScenario({
    scenarioId: "TC_REFERENCE",
    timeZone: "Asia/Kolkata",
  });

  assert.equal(result.ok, true);
  assert.equal(result.response.timing.hoursBeforeDeparture, 14.83);
  assert.equal(result.response.state.cancellationDateTimeLocal, "2026-11-02T16:55");
  assert.equal(result.response.state.departureDateTimeLocal, "2026-11-03T07:45");
});

test("all 25 golden comparison cases preserve their financial displays", () => {
  assert.equal(fixture.cases.length, 25);
  for (const testCase of fixture.cases) assertFinancialDisplayMatches(testCase);
});

test("all 78 golden passenger combinations preserve their financial displays", () => {
  assert.equal(fixture.passengerCombinationCases.length, 78);
  for (const testCase of fixture.passengerCombinationCases) {
    assertFinancialDisplayMatches(testCase);
  }
});
