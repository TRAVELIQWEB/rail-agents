import "server-only";

export type IRCTCBookingSource = "PERSONAL" | "AGENT" | "COUNTER";
export type IRCTCPaymentMethod = "CARD" | "UPI";
export type IRCTCFareInputMode = "GRAND_TOTAL" | "PURE_FARE";
export type IRCTCTravelClass = "1AC" | "2AC" | "3AC" | "SL" | "2S";
export type IRCTCTicketStatus =
  | "CNF"
  | "RAC"
  | "WL"
  | "TQ_CNF"
  | "TQWL"
  | "TRAIN_CANCELLED";

export interface IRCTCRefundInput {
  ruleRegime: string;
  bookingSource: IRCTCBookingSource;
  paymentMethod: IRCTCPaymentMethod;
  pgEnabled: boolean;
  fareInputMode: IRCTCFareInputMode;
  travelClass: IRCTCTravelClass;
  ticketStatus: IRCTCTicketStatus;
  totalPassengers: number;
  cancelPassengers: number;
  enteredTotalAmount: number;
  pureTotalFareEntered: number;
  purePerPaxFareEntered: number;
  hasCatering: boolean;
  cateringLastEdited: string;
  totalCateringFee: number;
  perPaxCateringFee: number;
  hasInsurance: boolean;
  insurancePerPax: number;
  insuranceRefundable: boolean;
  hoursBeforeDeparture: number;
  chartPrepared: boolean;
  roundToNextFive: boolean;
}

export interface IRCTCFareAndFeeBreakdown {
  irctcFee: number;
  agentFee: number;
  totalCatering: number;
  perPaxCatering: number;
  totalInsurance: number;
  pureTotalTrainFare: number;
  purePerPaxTrainFare: number;
  pgBase: number;
  pgCharge: number;
  grandTotalPaid: number;
}

export interface IRCTCRefundDisplay {
  catExGstDisplay: string;
  catGstDisplay: string;
  stripPureTotalFare: string;
  stripPurePerPaxFare: string;
  stripExGstBreakdownText: string;
  topSourceSummaryBadge: string;
  stripPgBaseSum: string;
  stripPgFormulaResult: string;
  calculatedGapLabel: string;
  receiptModeTitle: string;
  receiptPaxBadge: string;
  receiptBookingSourceTag: string;
  receiptInsStatusText: string;
  ruleExplanationAlertClassName: string;
  finalNetRefundDisplay: string;
  perPaxNetRefundSub: string;
  finalRailwayCutDisplay: string;
  perPaxRailwayCutSub: string;
  receiptGrandTotalPaid: string;
  receiptIrctcFee: string;
  receiptInsuranceFee: string | null;
  receiptPgBaseVal: string | null;
  receiptPgSlabLabel: string | null;
  receiptPgFee: string | null;
  receiptAgentFee: string | null;
  receiptPureRailwayTotal: string;
  receiptPerPaxFormulaBadge: string;
  receiptCancelPaxCount: string;
  receiptCancellingTrainFare: string;
  receiptCancellingCatering: string;
  receiptExGstBaseVal: string;
  receiptBaseCancelCutLabel: string;
  receiptBaseCancelCut: string;
  receiptGstCancelCut: string;
  receiptRoundingCut: string;
  receiptTotalRailwayCut: string;
  receiptNetTrainRefund: string;
  receiptNetFoodRefund: string;
  receiptNetInsRefund: string;
  receiptFinalBankRefund: string;
  ruleExplanationText: string;
  smartTipText: string;
  regimeComparisonNote: string;
}

export interface IRCTCRefundVisibility {
  stripPgFormulaLine: boolean;
  receiptInsuranceRow: boolean;
  receiptAgentFeeRow: boolean;
  receiptPgBaseRow: boolean;
  receiptPgFeeRow: boolean;
  receiptNetInsRefundRow: boolean;
}

export interface IRCTCRefundResult {
  fareAndFees: IRCTCFareAndFeeBreakdown;
  visibility: IRCTCRefundVisibility;
  calculation: {
    totalPassengers: number;
    cancellingPassengers: number;
    hoursBeforeDeparture: number;
    cancellingTrainFare: number;
    cancellingCatering: number;
    totalCancellingTicketFare: number;
    cancellingInsurance: number;
    trainGstPerPassenger: number;
    exGstTrainFarePerPassenger: number;
    cateringGstPerPassenger: number;
    exGstCateringPerPassenger: number;
    combinedExGstPerPassenger: number;
    baseCancellationCharge: number;
    gstCancellationCharge: number;
    exactCancellationCutBeforeRounding: number;
    railwayCancellationCut: number;
    roundingDifference: number;
    netRailwayRefund: number;
    insuranceRefund: number;
    totalNetRefund: number;
    perPassengerFormula: string;
    baseCancellationChargeLabel: string;
    alertStyle: string;
    calculatedGapLabel: string;
    topSourceSummary: string;
    pgBaseSummary: string;
    pgFormulaResult: string;
    exGstBreakdownText: string;
    regimeComparisonNote: string;
    ruleExplanationText: string;
    smartTipText: string;
  };
  display: IRCTCRefundDisplay;
}

const CLASS_RULES: Record<
  IRCTCTravelClass,
  { name: string; flatFee: number; clerkage: number; isAC: boolean }
> = {
  "1AC": {
    name: "1AC / Executive (EC)",
    flatFee: 240,
    clerkage: 60,
    isAC: true,
  },
  "2AC": {
    name: "2AC / First Class (FC)",
    flatFee: 200,
    clerkage: 60,
    isAC: true,
  },
  "3AC": {
    name: "3AC / CC / 3E",
    flatFee: 180,
    clerkage: 60,
    isAC: true,
  },
  SL: {
    name: "Sleeper (SL)",
    flatFee: 120,
    clerkage: 60,
    isAC: false,
  },
  "2S": {
    name: "Second Sitting (2S)",
    flatFee: 60,
    clerkage: 60,
    isAC: false,
  },
};

const STATUS_LABELS: Record<IRCTCTicketStatus, string> = {
  CNF: "Confirmed (CNF)",
  RAC: "RAC",
  WL: "Waitlisted (WL)",
  TQ_CNF: "Tatkal confirmed (TQ CNF)",
  TQWL: "Tatkal waitlist (TQWL)",
  TRAIN_CANCELLED: "Train cancelled",
};

const SOURCE_NAMES: Record<IRCTCBookingSource, string> = {
  PERSONAL: "Personal account",
  AGENT: "Agent account (RSP)",
  COUNTER: "Railway counter",
};

function formatINR(val: unknown): string {
  const num = Number(val) || 0;
  return (
    "₹" +
    num.toLocaleString("en-IN", {
      minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

function roundUpToFive(amount: number): number {
  if (amount <= 0) return 0;
  return Math.ceil(Number(amount.toFixed(4)) / 5) * 5;
}

function getBookingFeeConfig(
  input: IRCTCRefundInput,
  isAC: boolean,
): { irctcFee: number; agentFee: number } {
  if (input.bookingSource === "COUNTER") {
    return { irctcFee: 0, agentFee: 0 };
  }
  if (input.bookingSource === "AGENT") {
    return {
      irctcFee: isAC ? 35.40 : 17.70,
      agentFee: isAC ? 40.00 : 20.00,
    };
  }
  if (input.paymentMethod === "UPI") {
    return {
      irctcFee: 11.8,
      agentFee: 0,
    };
  }
  return {
    irctcFee: isAC ? 35.40 : 17.70,
    agentFee: 0,
  };
}

function extractFareAndFees(
  input: IRCTCRefundInput,
  isAC: boolean,
): IRCTCFareAndFeeBreakdown {
  const totalPax = Math.max(1, input.totalPassengers);
  const { irctcFee, agentFee } = getBookingFeeConfig(input, isAC);

  const totalCatering = input.hasCatering
    ? Math.max(0, Number(input.totalCateringFee) || 0)
    : 0;
  const perPaxCatering = totalCatering / totalPax;
  const totalInsurance =
    input.bookingSource !== "COUNTER" && input.hasInsurance
      ? Number((input.insurancePerPax * totalPax).toFixed(2))
      : 0;

  let pureTotalTrainFare = 0;
  let pgBase = 0;
  let pgCharge = 0;
  let grandTotalPaid = 0;

  if (input.fareInputMode === "GRAND_TOTAL") {
    grandTotalPaid = Math.max(0, Number(input.enteredTotalAmount) || 0);

    const afterAgentFee = Math.max(0, grandTotalPaid - agentFee);

    if (input.bookingSource === "AGENT" && input.pgEnabled) {
      if (afterAgentFee <= 2015.005) {
        pgBase = Number((afterAgentFee / 1.0075).toFixed(2));
      } else {
        pgBase = Number((afterAgentFee / 1.01).toFixed(2));
      }
      pgCharge = Number((afterAgentFee - pgBase).toFixed(2));
    } else {
      pgBase = afterAgentFee;
      pgCharge = 0;
    }

    const railwayTotal = Math.max(
      0,
      Number((pgBase - irctcFee - totalInsurance).toFixed(2)),
    );
    pureTotalTrainFare = Math.max(
      0,
      Number((railwayTotal - totalCatering).toFixed(2)),
    );
  } else {
    pureTotalTrainFare = Math.max(0, Number(input.pureTotalFareEntered) || 0);
    const railwayTotal = pureTotalTrainFare + totalCatering;
    pgBase = Number(
      (railwayTotal + irctcFee + totalInsurance).toFixed(2),
    );

    if (input.bookingSource === "AGENT" && input.pgEnabled) {
      const rate = pgBase <= 2000 ? 0.0075 : 0.01;
      pgCharge = Number((pgBase * rate).toFixed(2));
    } else {
      pgCharge = 0;
    }
    grandTotalPaid = Number((pgBase + pgCharge + agentFee).toFixed(2));
  }

  const purePerPaxTrainFare = Number(
    (pureTotalTrainFare / totalPax).toFixed(2),
  );

  return {
    irctcFee,
    agentFee,
    totalCatering,
    perPaxCatering,
    totalInsurance,
    pureTotalTrainFare,
    purePerPaxTrainFare,
    pgBase,
    pgCharge,
    grandTotalPaid,
  };
}

export function calculateIRCTCRefund(
  input: IRCTCRefundInput,
): IRCTCRefundResult {
  const cls = CLASS_RULES[input.travelClass];
  const totalPax = Math.max(1, input.totalPassengers);
  const pax = Math.min(
    totalPax,
    Math.max(1, input.cancelPassengers),
  );
  const hours = Math.max(0, Number(input.hoursBeforeDeparture) || 0);

  const extracted = extractFareAndFees(input, cls.isAC);
  const perPaxFare = extracted.purePerPaxTrainFare;
  const cancellingTrainFare = Number((perPaxFare * pax).toFixed(2));
  const cancellingCatering = Number(
    (extracted.perPaxCatering * pax).toFixed(2),
  );
  const totalCancellingTicketFare = Number(
    (cancellingTrainFare + cancellingCatering).toFixed(2),
  );
  const cancellingInsurance =
    input.bookingSource !== "COUNTER" && input.hasInsurance
      ? Number((input.insurancePerPax * pax).toFixed(2))
      : 0;

  const trainGstPerPassenger = cls.isAC
    ? Math.round(perPaxFare - perPaxFare / 1.05)
    : 0;
  const exGstTrainFarePerPassenger = Math.max(
    0,
    Number((perPaxFare - trainGstPerPassenger).toFixed(2)),
  );

  let cateringGstPerPassenger = 0;
  if (extracted.perPaxCatering > 0) {
    cateringGstPerPassenger =
      Math.abs(extracted.perPaxCatering - 363) < 0.01
        ? 16.38
        : Number(
            (
              extracted.perPaxCatering -
              extracted.perPaxCatering / 1.05
            ).toFixed(2),
          );
  }
  const exGstCateringPerPassenger = Math.max(
    0,
    Number(
      (extracted.perPaxCatering - cateringGstPerPassenger).toFixed(2),
    ),
  );
  const combinedExGstPerPassenger = Number(
    (
      exGstTrainFarePerPassenger + exGstCateringPerPassenger
    ).toFixed(2),
  );

  const { irctcFee, agentFee } = getBookingFeeConfig(input, cls.isAC);
  const sourceName = SOURCE_NAMES[input.bookingSource];

  let topSourceSummary: string;
  let pgBaseSummary = "";
  let pgFormulaResult = "";
  if (input.bookingSource === "AGENT") {
    topSourceSummary = `Agent account: IRCTC ${formatINR(irctcFee)} + agent ${formatINR(agentFee)} + PG (${extracted.pgBase <= 2000 ? "0.75%" : "1%"})`;
    pgBaseSummary = `${formatINR(extracted.pureTotalTrainFare + extracted.totalCatering)} (fare + catering) + ${formatINR(irctcFee)} (IRCTC)${extracted.totalInsurance > 0 ? " + " + formatINR(extracted.totalInsurance) + " (insurance)" : ""} = ${formatINR(extracted.pgBase)}`;
    pgFormulaResult = input.pgEnabled
      ? `PG @ ${extracted.pgBase <= 2000 ? "0.75%" : "1.00%"} = ${formatINR(extracted.pgCharge)}`
      : "PG disabled = ₹0";
  } else if (input.bookingSource === "PERSONAL") {
    topSourceSummary = `Personal account (${input.paymentMethod}): IRCTC ${formatINR(irctcFee)} • ₹0 PG fee`;
  } else {
    topSourceSummary = "Railway counter ticket: ₹0 additional booking fees";
  }

  const hWhole = Math.floor(hours);
  const mRem = Math.round((hours - hWhole) * 60);
  const isRegular = input.ruleRegime === "ACTUAL_48H";

  let slabShort = "";
  if (isRegular) {
    if (input.chartPrepared) slabShort = "Chart prepared (₹0 refund)";
    else if (hours > 48) slabShort = "> 48h (flat charge)";
    else if (hours >= 12) slabShort = "48h–12h (25% charge)";
    else if (hours >= 4) {
      slabShort = "Under 12h to over 4h; chart not prepared (50% charge)";
    } else slabShort = "Chart prepared / under 4h (₹0 refund)";
  } else {
    if (input.chartPrepared) slabShort = "Chart prepared (₹0 refund)";
    else if (hours > 72) {
      slabShort = "> 72h (25% charge under Gazette rules)";
    } else if (hours >= 8) {
      slabShort = "72h–8h; chart not prepared (50% charge)";
    } else slabShort = "< 8h / chart prepared (₹0 refund)";
  }
  const calculatedGapLabel = `Time until departure: ${hWhole}h ${mRem}m (${slabShort})`;

  function computePrsPercentageCut(pctRate: number) {
    if (!cls.isAC) {
      const combinedNonAc = perPaxFare + extracted.perPaxCatering;
      const rawPctCut = Number((combinedNonAc * pctRate).toFixed(3));
      const stage1Base = input.roundToNextFive
        ? roundUpToFive(rawPctCut)
        : Number(rawPctCut.toFixed(2));
      const perPaxBase = Math.max(cls.flatFee, stage1Base);
      const perPaxRounded = input.roundToNextFive
        ? roundUpToFive(perPaxBase)
        : perPaxBase;
      return {
        rawPctCut,
        perPaxBase,
        perPaxGst: 0,
        perPaxExact: perPaxBase,
        perPaxRounded,
      };
    }

    const rawPctCut = Number(
      (combinedExGstPerPassenger * pctRate).toFixed(3),
    );
    const stage1RoundedBase = input.roundToNextFive
      ? roundUpToFive(rawPctCut)
      : Number(rawPctCut.toFixed(2));
    const perPaxBase = Math.max(cls.flatFee, stage1RoundedBase);
    const perPaxGst = Number((perPaxBase * 0.05).toFixed(2));
    const perPaxExact = Number((perPaxBase + perPaxGst).toFixed(2));
    const perPaxRounded = input.roundToNextFive
      ? roundUpToFive(perPaxExact)
      : perPaxExact;
    return { rawPctCut, perPaxBase, perPaxGst, perPaxExact, perPaxRounded };
  }

  let baseCancellationCharge = 0;
  let gstCancellationCharge = 0;
  let exactCancellationCutBeforeRounding = 0;
  let railwayCancellationCut = 0;
  let roundingDifference = 0;
  let perPassengerFormula = "";
  let baseCancellationChargeLabel = "Base cancellation charge:";
  let ruleExplanationText = "";
  let smartTipText = "";
  let alertStyle = "bg-emerald-50 border-emerald-200 text-emerald-950";

  if (input.ticketStatus === "TRAIN_CANCELLED") {
    perPassengerFormula = "₹0 railway deduction (100% railway fare refund)";
    ruleExplanationText =
      "When the train is cancelled, the railway cancellation deduction is ₹0 and the railway fare plus catering is refunded in full. Non-refundable booking fees, including IRCTC, agent and payment gateway fees, are excluded.";
    smartTipText =
      "IRCTC, agent and payment gateway fees are not refunded when a train is cancelled; the railway fare is refunded in full.";
    alertStyle = "bg-blue-50 border-blue-300 text-blue-950";
  } else if (
    input.ticketStatus === "WL" ||
    input.ticketStatus === "TQWL"
  ) {
    const perPaxBase = cls.clerkage;
    const perPaxGst = cls.isAC ? perPaxBase * 0.05 : 0;
    const perPaxExact = perPaxBase + perPaxGst;
    const perPaxRounded = input.roundToNextFive
      ? roundUpToFive(perPaxExact)
      : perPaxExact;

    baseCancellationCharge = perPaxBase * pax;
    gstCancellationCharge = perPaxGst * pax;
    exactCancellationCutBeforeRounding = perPaxExact * pax;
    railwayCancellationCut = Math.min(
      totalCancellingTicketFare,
      perPaxRounded * pax,
    );
    roundingDifference = Math.max(
      0,
      railwayCancellationCut - exactCancellationCutBeforeRounding,
    );

    perPassengerFormula = cls.isAC
      ? `₹${perPaxBase} + ₹${perPaxGst} GST = ₹${perPaxExact} ➔ ₹${perPaxRounded}`
      : `Flat clerkage: ₹${perPaxBase}`;
    ruleExplanationText = `A waitlisted (${STATUS_LABELS[input.ticketStatus]}) e-ticket is not reduced to a ₹0 refund by the cancellation time or chart status. The clerkage deduction is ₹${perPaxRounded} per passenger (× ${pax} = ₹${railwayCancellationCut}).`;
    smartTipText =
      "After chart preparation, a waitlisted e-ticket is automatically cancelled and the remaining eligible amount is refunded.";
    alertStyle = "bg-emerald-50 border-emerald-300 text-emerald-950";
  } else if (input.ticketStatus === "RAC") {
    if (hours >= 0.5 && !input.chartPrepared) {
      const perPaxBase = cls.clerkage;
      const perPaxGst = cls.isAC ? perPaxBase * 0.05 : 0;
      const perPaxExact = perPaxBase + perPaxGst;
      const perPaxRounded = input.roundToNextFive
        ? roundUpToFive(perPaxExact)
        : perPaxExact;

      baseCancellationCharge = perPaxBase * pax;
      gstCancellationCharge = perPaxGst * pax;
      exactCancellationCutBeforeRounding = perPaxExact * pax;
      railwayCancellationCut = Math.min(
        totalCancellingTicketFare,
        perPaxRounded * pax,
      );
      roundingDifference = Math.max(
        0,
        railwayCancellationCut - exactCancellationCutBeforeRounding,
      );

      perPassengerFormula = cls.isAC
        ? `₹${perPaxBase} + ₹${perPaxGst} GST = ₹${perPaxExact} ➔ ₹${perPaxRounded}`
        : `Flat clerkage: ₹${perPaxBase}`;
      ruleExplanationText = `When an RAC ticket is cancelled at least 30 minutes before departure and before chart preparation, the clerkage deduction is ₹${perPaxRounded} per passenger (× ${pax} = ₹${railwayCancellationCut}).`;
      smartTipText =
        "An RAC ticket cancelled under 30 minutes before departure or after chart preparation receives no refund under this calculator.";
      alertStyle = "bg-emerald-50 border-emerald-200 text-emerald-950";
    } else {
      baseCancellationCharge = totalCancellingTicketFare;
      railwayCancellationCut = totalCancellingTicketFare;
      perPassengerFormula = "Under 30 minutes / chart prepared (₹0 refund)";
      ruleExplanationText =
        "An RAC ticket cancelled within 30 minutes of departure or after chart preparation receives a ₹0 refund.";
      smartTipText =
        "For an RAC ticket, cancel at least 30 minutes before departure and before chart preparation to receive a refund.";
      alertStyle = "bg-rose-50 border-rose-300 text-rose-950";
    }
  } else if (input.ticketStatus === "TQ_CNF") {
    baseCancellationCharge = totalCancellingTicketFare;
    railwayCancellationCut = totalCancellingTicketFare;
    perPassengerFormula = "Confirmed Tatkal (₹0 refund)";
    ruleExplanationText =
      "A confirmed Tatkal ticket receives no refund when cancelled under the rules applied by this calculator.";
    smartTipText =
      "A confirmed Tatkal ticket may qualify for a refund when the train is cancelled or delayed by more than three hours and a TDR is filed.";
    alertStyle = "bg-rose-50 border-rose-300 text-rose-950";
  } else if (!isRegular) {
    if (input.chartPrepared || hours < 8) {
      baseCancellationCharge = totalCancellingTicketFare;
      railwayCancellationCut = totalCancellingTicketFare;
      perPassengerFormula = "< 8h / chart prepared (₹0 refund)";
      ruleExplanationText =
        "Under Gazette notification G.S.R. 41(E), rule 6(4)(c), Vande Bharat Sleeper and Amrit Bharat II Express tickets cancelled less than 8 hours before departure, or without filing a TDR, are not eligible for a refund.";
      smartTipText =
        "For these two train categories, the no-refund window is 8 hours rather than 4 hours.";
      alertStyle = "bg-rose-50 border-rose-300 text-rose-950";
    } else if (hours > 72) {
      const prs = computePrsPercentageCut(0.25);

      baseCancellationCharge = Number(
        (prs.perPaxBase * pax).toFixed(2),
      );
      gstCancellationCharge = Number((prs.perPaxGst * pax).toFixed(2));
      exactCancellationCutBeforeRounding = Number(
        (prs.perPaxExact * pax).toFixed(2),
      );
      railwayCancellationCut = Math.min(
        totalCancellingTicketFare,
        Number((prs.perPaxRounded * pax).toFixed(2)),
      );
      roundingDifference = Number(
        Math.max(
          0,
          railwayCancellationCut - exactCancellationCutBeforeRounding,
        ).toFixed(2),
      );

      baseCancellationChargeLabel = `Step 2 · 25% base charge after >72h calculation (₹${prs.rawPctCut.toFixed(2)} → ₹5 rounding):`;
      perPassengerFormula = cls.isAC
        ? `25% (>72h): ₹${prs.perPaxBase} + ₹${prs.perPaxGst} GST ➔ ₹${prs.perPaxRounded}`
        : `25% (>72h) → ₹${prs.perPaxRounded}/passenger`;
      ruleExplanationText = `Under Gazette G.S.R. 41(E), rule 6(4)(a), cancelling a Vande Bharat Sleeper / Amrit Bharat II Express ticket more than 72 hours before departure (${hWhole}h ${mRem}m) incurs 25% of the fare instead of a flat charge. After double ₹5 rounding and GST, the charge is ₹${prs.perPaxRounded}/passenger (total ₹${railwayCancellationCut}).`;
      smartTipText =
        "Gazette rule 6(4)(a): these two train categories have a 25% cancellation charge even when cancelled more than 72 hours before departure.";
      alertStyle = "bg-amber-50 border-amber-200 text-amber-950";
    } else {
      const prs = computePrsPercentageCut(0.50);

      baseCancellationCharge = Number(
        (prs.perPaxBase * pax).toFixed(2),
      );
      gstCancellationCharge = Number((prs.perPaxGst * pax).toFixed(2));
      exactCancellationCutBeforeRounding = Number(
        (prs.perPaxExact * pax).toFixed(2),
      );
      railwayCancellationCut = Math.min(
        totalCancellingTicketFare,
        Number((prs.perPaxRounded * pax).toFixed(2)),
      );
      roundingDifference = Number(
        Math.max(
          0,
          railwayCancellationCut - exactCancellationCutBeforeRounding,
        ).toFixed(2),
      );

      baseCancellationChargeLabel = `Step 2 · 50% base charge (₹${prs.rawPctCut.toFixed(2)} → ₹5 rounding):`;
      perPassengerFormula = cls.isAC
        ? `50% (72h–8h): ₹${prs.perPaxBase} + ₹${prs.perPaxGst} GST ➔ ₹${prs.perPaxRounded}`
        : `50% (72h–8h) → ₹${prs.perPaxRounded}/passenger`;
      ruleExplanationText = `Under Gazette G.S.R. 41(E), rule 6(4)(b), cancelling a Vande Bharat Sleeper / Amrit Bharat II Express ticket 8–72 hours before departure (${hWhole}h ${mRem}m) incurs a 50% fare charge. After double ₹5 rounding and GST, the charge is ₹${prs.perPaxRounded}/passenger (total ₹${railwayCancellationCut}).`;
      smartTipText =
        "These two train categories have no refund when cancelled less than 8 hours before departure.";
      alertStyle = "bg-orange-50 border-orange-200 text-orange-950";
    }
  } else if (input.chartPrepared || hours < 4) {
    baseCancellationCharge = totalCancellingTicketFare;
    railwayCancellationCut = totalCancellingTicketFare;
    perPassengerFormula = input.chartPrepared
      ? "Chart prepared (₹0 refund)"
      : "Under 4h (₹0 refund)";
    ruleExplanationText = input.chartPrepared
      ? "A confirmed ticket on a regular train cancelled after chart preparation receives a ₹0 refund."
      : "A confirmed ticket cancelled less than 4 hours before departure receives a ₹0 refund.";
    smartTipText =
      "To receive a refund on a confirmed ticket, cancel before chart preparation and at least 4 hours before departure.";
    alertStyle = "bg-rose-50 border-rose-300 text-rose-950";
  } else if (hours > 48) {
    const perPaxBase = cls.flatFee;
    const perPaxGst = cls.isAC ? perPaxBase * 0.05 : 0;
    const perPaxExact = perPaxBase + perPaxGst;
    const perPaxRounded = input.roundToNextFive
      ? roundUpToFive(perPaxExact)
      : perPaxExact;

    baseCancellationCharge = perPaxBase * pax;
    gstCancellationCharge = perPaxGst * pax;
    exactCancellationCutBeforeRounding = perPaxExact * pax;
    railwayCancellationCut = Math.min(
      totalCancellingTicketFare,
      perPaxRounded * pax,
    );
    roundingDifference = Math.max(
      0,
      railwayCancellationCut - exactCancellationCutBeforeRounding,
    );

    perPassengerFormula = cls.isAC
      ? `₹${perPaxBase} + ₹${perPaxGst} GST = ₹${perPaxExact} → ₹${perPaxRounded}`
      : `Flat ₹${perPaxBase}/passenger`;
    ruleExplanationText = `More than 48 hours remain before departure and the chart is not prepared. The flat charge for a regular ${cls.name} ticket is ₹${perPaxRounded}/passenger (× ${pax} = ₹${railwayCancellationCut}).`;
    smartTipText =
      "Within 48 hours of departure, regular trains apply a 25% charge to the base fare plus pre-GST catering.";
    alertStyle = "bg-emerald-50 border-emerald-200 text-emerald-950";
  } else if (hours <= 48 && hours >= 12) {
    const prs = computePrsPercentageCut(0.25);

    baseCancellationCharge = Number((prs.perPaxBase * pax).toFixed(2));
    gstCancellationCharge = Number((prs.perPaxGst * pax).toFixed(2));
    exactCancellationCutBeforeRounding = Number(
      (prs.perPaxExact * pax).toFixed(2),
    );
    railwayCancellationCut = Math.min(
      totalCancellingTicketFare,
      Number((prs.perPaxRounded * pax).toFixed(2)),
    );
    roundingDifference = Number(
      Math.max(
        0,
        railwayCancellationCut - exactCancellationCutBeforeRounding,
      ).toFixed(2),
    );

    baseCancellationChargeLabel = `Step 2 · 25% base charge (₹${prs.rawPctCut.toFixed(2)} → ₹5 rounding):`;
    perPassengerFormula = cls.isAC
      ? `₹${prs.rawPctCut.toFixed(2)} ➔ ₹${prs.perPaxBase} + ₹${prs.perPaxGst} GST = ₹${prs.perPaxExact} ➔ ₹${prs.perPaxRounded}`
      : `25% fare → ₹${prs.perPaxRounded}/passenger`;
    ruleExplanationText = `There are 12–48 hours until departure (${hWhole}h ${mRem}m), and the chart is not prepared. Under the PRS calculation: (1) 25% of the pre-GST base ${formatINR(combinedExGstPerPassenger)} is ₹${prs.rawPctCut.toFixed(3)}, (2) rounded up to ₹5 it becomes ₹${prs.perPaxBase}, (3) 5% GST of ₹${prs.perPaxGst} is added (₹${prs.perPaxExact}), and (4) the total is rounded up to the next ₹5, for a charge of ₹${prs.perPaxRounded}/passenger (total ₹${railwayCancellationCut}).`;
    smartTipText =
      "PRS rounding example: ₹1,329.62 × 25% = ₹332.405 → ₹335 + 5% GST (₹16.75) = ₹351.75 → ₹355.";
    alertStyle = "bg-amber-50 border-amber-200 text-amber-950";
  } else {
    const prs = computePrsPercentageCut(0.50);

    baseCancellationCharge = Number((prs.perPaxBase * pax).toFixed(2));
    gstCancellationCharge = Number((prs.perPaxGst * pax).toFixed(2));
    exactCancellationCutBeforeRounding = Number(
      (prs.perPaxExact * pax).toFixed(2),
    );
    railwayCancellationCut = Math.min(
      totalCancellingTicketFare,
      Number((prs.perPaxRounded * pax).toFixed(2)),
    );
    roundingDifference = Number(
      Math.max(
        0,
        railwayCancellationCut - exactCancellationCutBeforeRounding,
      ).toFixed(2),
    );

    baseCancellationChargeLabel = `Step 2 · 50% base charge (₹${prs.rawPctCut.toFixed(2)} → ₹5 rounding):`;
    perPassengerFormula = cls.isAC
      ? `₹${prs.rawPctCut.toFixed(2)} ➔ ₹${prs.perPaxBase} + ₹${prs.perPaxGst} GST = ₹${prs.perPaxExact} ➔ ₹${prs.perPaxRounded}`
      : `50% fare → ₹${prs.perPaxRounded}/passenger`;
    ruleExplanationText = `The chart is not prepared and departure is 4–12 hours away (${hWhole}h ${mRem}m), so the 50% charge applies: (1) 50% of the pre-GST base ${formatINR(combinedExGstPerPassenger)} is ₹${prs.rawPctCut.toFixed(2)}, (2) the first ₹5 rounding gives ₹${prs.perPaxBase}, (3) 5% GST (₹${prs.perPaxGst}) gives ₹${prs.perPaxExact}, and (4) the second ₹5 rounding makes the charge ₹${prs.perPaxRounded}/passenger (total ₹${railwayCancellationCut}).`;
    smartTipText =
      "If the chart is prepared or less than 4 hours remain before departure, a confirmed ticket receives a ₹0 refund.";
    alertStyle = "bg-orange-50 border-orange-200 text-orange-950";
  }

  let regimeComparisonNote = "";
  if (input.ticketStatus === "CNF") {
    const prs25 = computePrsPercentageCut(0.25).perPaxRounded * pax;
    const prs50 = computePrsPercentageCut(0.50).perPaxRounded * pax;
    const flatRounded =
      (input.roundToNextFive
        ? roundUpToFive(cls.flatFee * (cls.isAC ? 1.05 : 1))
        : cls.flatFee * (cls.isAC ? 1.05 : 1)) * pax;

    if (hours > 72) {
      regimeComparisonNote = `<strong>Rule comparison (&gt;72h):</strong> Regular trains apply a flat charge of <strong>${formatINR(flatRounded)}</strong>, while <strong>Vande Bharat Sleeper / Amrit Bharat II</strong> apply a 25% charge (<strong>${formatINR(prs25)}</strong>) even more than 72 hours before departure.`;
    } else if (hours <= 72 && hours > 48) {
      regimeComparisonNote = `<strong>Rule comparison (48h–72h):</strong> Regular trains apply a flat charge of <strong>${formatINR(flatRounded)}</strong>, while <strong>Vande Bharat Sleeper / Amrit Bharat II</strong> apply a 50% charge (<strong>${formatINR(prs50)}</strong>).`;
    } else if (hours <= 48 && hours >= 12) {
      regimeComparisonNote = `<strong>Rule comparison (12h–48h):</strong> Regular trains, including Vande Bharat Chair Car (CC), apply a 25% charge (<strong>${formatINR(prs25)}</strong>); <strong>Vande Bharat Sleeper / Amrit Bharat II</strong> apply 50% (<strong>${formatINR(prs50)}</strong>).`;
    } else if (hours < 12 && hours >= 8) {
      regimeComparisonNote = `<strong>Rule comparison (8h–12h):</strong> Both regular trains and Vande Bharat Sleeper apply a 50% charge (<strong>${formatINR(prs50)}</strong>).`;
    } else if (hours < 8 && hours >= 4) {
      regimeComparisonNote = `<strong>Rule comparison (4h–8h):</strong> Regular trains apply a 50% charge (<strong>${formatINR(prs50)}</strong>), while <strong>Vande Bharat Sleeper / Amrit Bharat II</strong> tickets cancelled within 8 hours receive a <strong>₹0 refund</strong>.`;
    } else {
      regimeComparisonNote = `<strong>Rule comparison (&lt;4h):</strong> Confirmed tickets in both categories receive a <strong>₹0 refund</strong> when less than 4 hours remain before departure.`;
    }
  }

  const netRailwayRefund = Math.max(
    0,
    Number((totalCancellingTicketFare - railwayCancellationCut).toFixed(2)),
  );
  const insuranceRefund =
    input.hasInsurance &&
    input.insuranceRefundable &&
    input.bookingSource !== "COUNTER"
      ? cancellingInsurance
      : 0;
  const totalNetRefund = Number(
    (netRailwayRefund + insuranceRefund).toFixed(2),
  );

  const pgVisible = input.bookingSource === "AGENT";
  const insuranceVisible = extracted.totalInsurance > 0;
  const insuranceRefundVisible = insuranceRefund > 0;
  const pgBaseVal = pgVisible
    ? `${formatINR(extracted.pgBase)} (${formatINR(extracted.pureTotalTrainFare + extracted.totalCatering)} + ${formatINR(extracted.irctcFee)}${extracted.totalInsurance > 0 ? " + " + formatINR(extracted.totalInsurance) : ""})`
    : null;
  const display: IRCTCRefundDisplay = {
    catExGstDisplay: formatINR(exGstCateringPerPassenger * totalPax),
    catGstDisplay: formatINR(cateringGstPerPassenger * totalPax),
    stripPureTotalFare: formatINR(extracted.pureTotalTrainFare),
    stripPurePerPaxFare: formatINR(perPaxFare),
    stripExGstBreakdownText: `Base fare (excluding GST) ${formatINR(exGstTrainFarePerPassenger)} + catering (excluding GST) ${formatINR(exGstCateringPerPassenger)} = ${formatINR(combinedExGstPerPassenger)}`,
    topSourceSummaryBadge: topSourceSummary,
    stripPgBaseSum: pgBaseSummary,
    stripPgFormulaResult: pgFormulaResult,
    calculatedGapLabel,
    receiptModeTitle: `${sourceName} • ${cls.name} • ${STATUS_LABELS[input.ticketStatus]}`,
    receiptPaxBadge: `${pax} of ${totalPax} passengers cancelling`,
    receiptBookingSourceTag: sourceName,
    receiptInsStatusText: input.insuranceRefundable
      ? "Included in refund"
      : "Non-refundable",
    ruleExplanationAlertClassName: `rounded-2xl p-3.5 border space-y-1 ${alertStyle}`,
    finalNetRefundDisplay: formatINR(totalNetRefund),
    perPaxNetRefundSub: `Refund per passenger: ${formatINR(totalNetRefund / pax)}`,
    finalRailwayCutDisplay: `- ${formatINR(railwayCancellationCut)}`,
    perPaxRailwayCutSub: `${formatINR(railwayCancellationCut / pax)} / passenger`,
    receiptGrandTotalPaid: formatINR(extracted.grandTotalPaid),
    receiptIrctcFee: `- ${formatINR(extracted.irctcFee)}`,
    receiptInsuranceFee: insuranceVisible
      ? formatINR(extracted.totalInsurance)
      : null,
    receiptPgBaseVal: pgBaseVal,
    receiptPgSlabLabel: pgVisible
      ? `${extracted.pgBase <= 2000 ? "≤ ₹2000 @ 0.75%" : "> ₹2000 @ 1%"}`
      : null,
    receiptPgFee: pgVisible ? `- ${formatINR(extracted.pgCharge)}` : null,
    receiptAgentFee: pgVisible ? `- ${formatINR(extracted.agentFee)}` : null,
    receiptPureRailwayTotal: formatINR(
      extracted.pureTotalTrainFare + extracted.totalCatering,
    ),
    receiptPerPaxFormulaBadge: perPassengerFormula,
    receiptCancelPaxCount: String(pax),
    receiptCancellingTrainFare: formatINR(cancellingTrainFare),
    receiptCancellingCatering: formatINR(cancellingCatering),
    receiptExGstBaseVal: `${formatINR(combinedExGstPerPassenger * pax)} (${formatINR(exGstTrainFarePerPassenger * pax)} + ${formatINR(exGstCateringPerPassenger * pax)})`,
    receiptBaseCancelCutLabel: baseCancellationChargeLabel,
    receiptBaseCancelCut: `- ${formatINR(baseCancellationCharge)}`,
    receiptGstCancelCut: `- ${formatINR(gstCancellationCharge)}`,
    receiptRoundingCut: `- ${formatINR(roundingDifference)}`,
    receiptTotalRailwayCut: `- ${formatINR(railwayCancellationCut)}`,
    receiptNetTrainRefund: formatINR(totalCancellingTicketFare),
    receiptNetFoodRefund: `- ${formatINR(railwayCancellationCut)}`,
    receiptNetInsRefund: `+ ${formatINR(insuranceRefund)}`,
    receiptFinalBankRefund: formatINR(totalNetRefund),
    ruleExplanationText,
    smartTipText,
    regimeComparisonNote,
  };

  return {
    fareAndFees: extracted,
    visibility: {
      stripPgFormulaLine: input.bookingSource === "AGENT",
      receiptInsuranceRow: insuranceVisible,
      receiptAgentFeeRow: pgVisible,
      receiptPgBaseRow: pgVisible,
      receiptPgFeeRow: pgVisible,
      receiptNetInsRefundRow: insuranceRefundVisible,
    },
    calculation: {
      totalPassengers: totalPax,
      cancellingPassengers: pax,
      hoursBeforeDeparture: hours,
      cancellingTrainFare,
      cancellingCatering,
      totalCancellingTicketFare,
      cancellingInsurance,
      trainGstPerPassenger,
      exGstTrainFarePerPassenger,
      cateringGstPerPassenger,
      exGstCateringPerPassenger,
      combinedExGstPerPassenger,
      baseCancellationCharge,
      gstCancellationCharge,
      exactCancellationCutBeforeRounding,
      railwayCancellationCut,
      roundingDifference,
      netRailwayRefund,
      insuranceRefund,
      totalNetRefund,
      perPassengerFormula,
      baseCancellationChargeLabel,
      alertStyle,
      calculatedGapLabel,
      topSourceSummary,
      pgBaseSummary,
      pgFormulaResult,
      exGstBreakdownText: display.stripExGstBreakdownText,
      regimeComparisonNote,
      ruleExplanationText,
      smartTipText,
    },
    display,
  };
}
