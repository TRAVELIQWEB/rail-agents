type CalculatorElement = HTMLElement & {
  value: string;
  checked?: boolean;
  disabled: boolean;
  type?: string;
  dataset: Record<string, string>;
};

interface CalculatorFormState {
  bookingSource: string;
  paymentMethod: string;
  ruleRegime: string;
  travelClass: string;
  ticketStatus: string;
  fareInputMode: string;
  pgEnabled: boolean;
  chartPrepared: boolean;
  roundToNextFive: boolean;
  totalPassengersRaw: string;
  cancelPassengersRaw: string;
  enteredTotalAmountRaw: string;
  pureTotalFareEnteredRaw: string;
  purePerPaxFareEnteredRaw: string;
  hasCatering: boolean;
  cateringLastEdited: string;
  totalCateringFeeRaw: string;
  perPaxCateringFeeRaw: string;
  hasInsurance: boolean;
  insurancePerPaxRaw: string;
  insuranceRefundable: boolean;
  cancellationDateTimeLocal: string;
  departureDateTimeLocal: string;
  timeZone: string;
  quickTimeBandId: string | null;
}

interface CalculatorSummary {
  visibility: {
    personalPaymentOptions: boolean;
    agentPaymentGatewayOptions: boolean;
    grandTotalFareInput: boolean;
    pureFareInputs: boolean;
    cateringInputs: boolean;
    insuranceInputs: boolean;
    insuranceRefundEligible: boolean;
  };
  disabledCancelPassengerOptions: string[];
  selectedInsurancePresetId: string | null;
  activeQuickTimeBandId: string | null;
  ruleRegimeBadge: string;
  timeBandSectionLabel: string;
  timeBands: Array<{ id: string; label: string[] }>;
  ruleRegimeButtonLabels: { actual: string; sleeper: string };
  paymentGatewayToggleLabel: string;
  roundingToggleLabel: string;
}

interface RefundApiTiming {
  cancellationDateTimeLocal: string;
  departureDateTimeLocal: string;
  hoursBeforeDeparture: number;
  calculatedGapLabel: string;
  quickTimeBandId: string | null;
  activeQuickTimeBandId: string | null;
  departureBeforeCancellation: boolean;
  validationStatus: "valid" | "departure-before-cancellation";
}

interface RefundApiResult {
  display: Record<string, string | null>;
  visibility: Record<string, boolean>;
  alertTone: "emerald" | "blue" | "rose" | "amber" | "orange";
  timing: RefundApiTiming;
}

const refundDisplayFields = [
  "catExGstDisplay",
  "catGstDisplay",
  "stripPureTotalFare",
  "stripPurePerPaxFare",
  "stripExGstBreakdownText",
  "topSourceSummaryBadge",
  "stripPgBaseSum",
  "stripPgFormulaResult",
  "calculatedGapLabel",
  "receiptModeTitle",
  "receiptPaxBadge",
  "receiptBookingSourceTag",
  "receiptInsStatusText",
  "finalNetRefundDisplay",
  "perPaxNetRefundSub",
  "finalRailwayCutDisplay",
  "perPaxRailwayCutSub",
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
  "receiptBaseCancelCutLabel",
  "receiptBaseCancelCut",
  "receiptGstCancelCut",
  "receiptRoundingCut",
  "receiptTotalRailwayCut",
  "receiptNetTrainRefund",
  "receiptNetFoodRefund",
  "receiptNetInsRefund",
  "receiptFinalBankRefund",
  "ruleExplanationText",
  "smartTipText",
  "regimeComparisonNote",
] as const;

const refundVisibilityFields = [
  "stripPgFormulaLine",
  "receiptInsuranceRow",
  "receiptAgentFeeRow",
  "receiptPgBaseRow",
  "receiptPgFeeRow",
  "receiptNetInsRefundRow",
] as const;

const alertToneClasses = {
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-950",
  blue: "bg-blue-50 border-blue-300 text-blue-950",
  rose: "bg-rose-50 border-rose-300 text-rose-950",
  amber: "bg-amber-50 border-amber-200 text-amber-950",
  orange: "bg-orange-50 border-orange-200 text-orange-950",
} as const;

const quietButtonClassName =
  "inline-flex min-h-9 sm:min-h-10 items-center justify-center rounded-xl border border-[#e4d5c4] bg-white px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-stone-700 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all hover:border-orange-300 hover:bg-[#fff9f3] hover:text-orange-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer";
const choiceButtonClassName =
  "min-h-11 sm:min-h-12 rounded-xl border border-[#e4d5c4] bg-[#faf6f0]/70 px-3.5 py-2 sm:py-2.5 text-left text-xs sm:text-sm text-stone-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:text-stone-900 hover:shadow-[0_4px_12px_rgba(249,115,22,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRefundApiResult(value: unknown): value is {
  result: RefundApiResult;
  timing?: RefundApiTiming;
  summary?: CalculatorSummary;
} {
  if (!isRecord(value) || !isRecord(value.result)) return false;
  const { display, visibility, alertTone, timing } = value.result;
  return (
    isRecord(display) &&
    Object.keys(display).length === refundDisplayFields.length &&
    refundDisplayFields.every((field) => field in display) &&
    Object.values(display).every(
      (field) => typeof field === "string" || field === null,
    ) &&
    isRecord(visibility) &&
    Object.keys(visibility).length === refundVisibilityFields.length &&
    refundVisibilityFields.every((field) => field in visibility) &&
    Object.values(visibility).every((field) => typeof field === "boolean") &&
    typeof alertTone === "string" &&
    alertTone in alertToneClasses &&
    isTimingResult(timing)
  );
}

function isTimingResult(value: unknown): value is RefundApiTiming {
  return (
    isRecord(value) &&
    typeof value.cancellationDateTimeLocal === "string" &&
    typeof value.departureDateTimeLocal === "string" &&
    typeof value.hoursBeforeDeparture === "number" &&
    Number.isFinite(value.hoursBeforeDeparture) &&
    typeof value.calculatedGapLabel === "string" &&
    (typeof value.quickTimeBandId === "string" || value.quickTimeBandId === null) &&
    (typeof value.activeQuickTimeBandId === "string" ||
      value.activeQuickTimeBandId === null) &&
    typeof value.departureBeforeCancellation === "boolean" &&
    (value.validationStatus === "valid" ||
      value.validationStatus === "departure-before-cancellation")
  );
}

function isSummary(value: unknown): value is CalculatorSummary {
  return (
    isRecord(value) &&
    isRecord(value.visibility) &&
    Object.values(value.visibility).every((field) => typeof field === "boolean") &&
    Array.isArray(value.disabledCancelPassengerOptions) &&
    value.disabledCancelPassengerOptions.every((field) => typeof field === "string") &&
    (typeof value.selectedInsurancePresetId === "string" ||
      value.selectedInsurancePresetId === null) &&
    (typeof value.activeQuickTimeBandId === "string" ||
      value.activeQuickTimeBandId === null) &&
    typeof value.ruleRegimeBadge === "string" &&
    typeof value.timeBandSectionLabel === "string" &&
    Array.isArray(value.timeBands) &&
    value.timeBands.every(
      (band) =>
        isRecord(band) &&
        typeof band.id === "string" &&
        Array.isArray(band.label) &&
        band.label.every((label) => typeof label === "string"),
    ) &&
    isRecord(value.ruleRegimeButtonLabels) &&
    typeof value.ruleRegimeButtonLabels.actual === "string" &&
    typeof value.ruleRegimeButtonLabels.sleeper === "string" &&
    typeof value.paymentGatewayToggleLabel === "string" &&
    typeof value.roundingToggleLabel === "string"
  );
}

let activeCalculatorRoot: HTMLElement | null = null;
const initializedRoots = new WeakSet<HTMLElement>();

function getElement(id: string): CalculatorElement {
  const element =
    activeCalculatorRoot?.querySelector<CalculatorElement>(`#${id}`);
  if (!element) throw new Error(`Refund calculator element not found: #${id}`);
  return element;
}

export function initializeIRCTCCalculator(root: HTMLElement): void {
  if (initializedRoots.has(root)) return;
  initializedRoots.add(root);
  activeCalculatorRoot = root;
  void initializeCalculator();
}

async function initializeCalculator(): Promise<void> {
  const response = await fetch("/api/irctc-cancellation-refund", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation: "metadata" }),
  }).catch(() => null);
  if (!response?.ok) {
    showError("The refund service is unavailable. Please refresh and try again.");
    return;
  }
  const metadata: unknown = await response.json().catch(() => null);
  if (!isRecord(metadata) || !isRecord(metadata.initialState)) {
    showError("The refund service returned an unexpected setup response.");
    return;
  }

  const state = metadata.initialState as unknown as CalculatorFormState;
  if (!isSummary(metadata.initialSummary)) {
    showError("The refund service returned an unexpected setup response.");
    return;
  }
  const summary = metadata.initialSummary;
  applyState(state, summary);
  applyMetadata(metadata);
  bindEvents(state, summary);
}

function showError(message: string): void {
  const element = getElement("calculatorValidationMessage");
  element.textContent = message;
  element.classList.remove("hidden");
}

function setText(id: string, value: string): void {
  getElement(id).textContent = value;
}

function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function applyMetadata(metadata: Record<string, unknown>): void {
  renderMetadataButtons(
    metadata.cateringPresets,
    "cateringPresetOptions",
    `food-preset-btn ${quietButtonClassName} min-h-8 px-2 text-xs`,
    "cateringPresetId",
  );
  renderMetadataButtons(
    metadata.insurancePresets,
    "insurancePresetOptions",
    `ins-rate-btn ${quietButtonClassName} min-h-9 text-xs`,
    "insurancePresetId",
  );
  if (typeof metadata.agentPaymentGatewayDescription === "string") {
    setText("agentPgDescription", metadata.agentPaymentGatewayDescription);
  }
  renderMetadataButtons(
    metadata.scenarios,
    "verificationScenarioOptions",
    `testcase-btn ${quietButtonClassName} min-h-9 text-xs`,
    "testcase",
  );
}

function renderMetadataButtons(
  entries: unknown,
  containerId: string,
  className: string,
  datasetKey: string,
): void {
  if (!Array.isArray(entries)) return;
  const container = activeCalculatorRoot?.querySelector(`#${containerId}`);
  if (!container) return;
  container.replaceChildren();
  for (const entry of entries) {
    if (!isRecord(entry) || typeof entry.id !== "string" || typeof entry.label !== "string") {
      continue;
    }
    const button = container.ownerDocument.createElement("button") as CalculatorElement;
    button.type = "button";
    button.className = className;
    button.dataset[datasetKey] = entry.id;
    button.textContent = entry.label;
    container.append(button);
  }
}

function readFormState(state: CalculatorFormState): CalculatorFormState {
  return {
    ...state,
    totalPassengersRaw: getElement("totalPassengersInput").value,
    cancelPassengersRaw: getElement("cancelPassengersInput").value,
    enteredTotalAmountRaw: getElement("enteredGrandTotalInput").value,
    pureTotalFareEnteredRaw: getElement("pureTotalFareInput").value,
    purePerPaxFareEnteredRaw: getElement("purePerPaxFareInput").value,
    totalCateringFeeRaw: getElement("totalCateringInput").value,
    perPaxCateringFeeRaw: getElement("perPaxCateringInput").value,
    insurancePerPaxRaw: getElement("customInsRateInput").value,
    chartPrepared: getElement("chartPreparedCheckbox").checked === true,
    insuranceRefundable: getElement("insRefundableCheckbox").checked === true,
    cancellationDateTimeLocal: getElement("cancelDateTime").value,
    departureDateTimeLocal: getElement("departureDateTime").value,
    timeZone: getBrowserTimeZone(),
  };
}

function applyState(
  state: CalculatorFormState,
  summary: CalculatorSummary,
): void {
  const values: Array<[string, keyof CalculatorFormState]> = [
    ["totalPassengersInput", "totalPassengersRaw"],
    ["cancelPassengersInput", "cancelPassengersRaw"],
    ["enteredGrandTotalInput", "enteredTotalAmountRaw"],
    ["pureTotalFareInput", "pureTotalFareEnteredRaw"],
    ["purePerPaxFareInput", "purePerPaxFareEnteredRaw"],
    ["totalCateringInput", "totalCateringFeeRaw"],
    ["perPaxCateringInput", "perPaxCateringFeeRaw"],
    ["customInsRateInput", "insurancePerPaxRaw"],
    ["cancelDateTime", "cancellationDateTimeLocal"],
    ["departureDateTime", "departureDateTimeLocal"],
  ];
  for (const [elementId, stateKey] of values) {
    getElement(elementId).value = state[stateKey] as string;
  }
  getElement("chartPreparedCheckbox").checked = state.chartPrepared;
  getElement("insRefundableCheckbox").checked = state.insuranceRefundable;
  refreshUIHighlights(state, summary);
}

function refreshUIHighlights(
  state: CalculatorFormState,
  summary: CalculatorSummary,
): void {
  setText("ruleRegimeBadge", summary.ruleRegimeBadge ?? "");
  setText("slabSectionTitleLabel", summary.timeBandSectionLabel ?? "");
  if (summary.ruleRegimeButtonLabels) {
    setText("regimeActualBtn", summary.ruleRegimeButtonLabels.actual);
    setText("regimeRumoredBtn", summary.ruleRegimeButtonLabels.sleeper);
  }
  for (const band of summary.timeBands ?? []) {
    let button = activeCalculatorRoot?.querySelector<CalculatorElement>(
      `.slab-btn[data-time-band="${CSS.escape(band.id)}"]`,
    );
    if (!button) {
      const container = getElement("quickTimeBandOptions");
      button = container.ownerDocument.createElement("button") as CalculatorElement;
      button.type = "button";
      button.className =
        `slab-btn ${choiceButtonClassName} min-h-[72px]`;
      button.dataset.timeBand = band.id;
      const title = container.ownerDocument.createElement("span");
      title.className = "block font-semibold text-[#0f2747]";
      const description = container.ownerDocument.createElement("span");
      description.className = "mt-1 block text-xs text-slate-500";
      button.append(title, description);
      container.append(button);
    }
    const spans = button.querySelectorAll("span");
    if (typeof band.label[0] === "string" && spans[0]) spans[0].textContent = band.label[0];
    if (typeof band.label[1] === "string" && spans[1]) spans[1].textContent = band.label[1];
  }
  const isRegular = state.ruleRegime === "ACTUAL_48H";
  getElement("regimeActualBtn").classList.toggle("active", isRegular);
  getElement("regimeRumoredBtn").classList.toggle("active", !isRegular);

  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(
    ".source-btn",
  ) ?? []) {
    button.classList.toggle("active-card", button.dataset.source === state.bookingSource);
  }
  getElement("personalPaymentSubBar").classList.toggle(
    "hidden",
    !summary.visibility?.personalPaymentOptions,
  );
  getElement("agentPgSubBar").classList.toggle(
    "hidden",
    !summary.visibility?.agentPaymentGatewayOptions,
  );
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(
    ".pay-btn",
  ) ?? []) {
    button.classList.toggle("active-pill", button.dataset.pay === state.paymentMethod);
  }
  const pgButton = getElement("togglePgBtn");
  pgButton.textContent = summary.paymentGatewayToggleLabel ?? "";
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(
    ".class-btn",
  ) ?? []) {
    button.classList.toggle("active-card", button.dataset.class === state.travelClass);
  }
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(
    ".status-btn",
  ) ?? []) {
    button.classList.toggle("active-card", button.dataset.status === state.ticketStatus);
  }
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(
    ".slab-btn",
  ) ?? []) {
    button.classList.toggle(
      "active-card",
      button.dataset.timeBand === state.quickTimeBandId ||
        button.dataset.timeBand === summary.activeQuickTimeBandId,
    );
  }
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(
    ".total-pax-btn",
  ) ?? []) {
    button.classList.toggle(
      "active-pill",
      button.dataset.totalpax === state.totalPassengersRaw,
    );
  }
  const disabledCancelOptions = summary.disabledCancelPassengerOptions ?? [];
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(
    ".cancel-pax-btn",
  ) ?? []) {
    const disabled = disabledCancelOptions.includes(button.dataset.cancelpax);
    button.disabled = disabled;
    button.classList.toggle("opacity-40", disabled);
    button.classList.toggle("cursor-not-allowed", disabled);
    button.classList.toggle(
      "active-pill",
      button.dataset.cancelpax === state.cancelPassengersRaw,
    );
  }
  getElement("modeGrandTotalBtn").classList.toggle(
    "active-pill",
    summary.visibility?.grandTotalFareInput === true,
  );
  getElement("modePureFareBtn").classList.toggle(
    "active-pill",
    summary.visibility?.pureFareInputs === true,
  );
  getElement("grandTotalInputPanel").classList.toggle(
    "hidden",
    !summary.visibility?.grandTotalFareInput,
  );
  getElement("pureFareInputPanel").classList.toggle(
    "hidden",
    !summary.visibility?.pureFareInputs,
  );
  getElement("cateringInputsArea").classList.toggle(
    "hidden",
    !summary.visibility?.cateringInputs,
  );
  getElement("insuranceInputsArea").classList.toggle(
    "hidden",
    !summary.visibility?.insuranceInputs,
  );
  getElement("catYesBtn").classList.toggle("active-green-pill", state.hasCatering);
  getElement("catNoBtn").classList.toggle("active-pill", !state.hasCatering);
  getElement("insYesBtn").classList.toggle("active-green-pill", state.hasInsurance);
  getElement("insNoBtn").classList.toggle("active-pill", !state.hasInsurance);
  getElement("toggleRoundingBtn").textContent = summary.roundingToggleLabel ?? "";
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(
    ".ins-rate-btn",
  ) ?? []) {
    button.classList.toggle(
      "active-pill",
      button.dataset.insurancePresetId === summary.selectedInsurancePresetId,
    );
  }
}

function markResultsPending(): number {
  const root = activeCalculatorRoot;
  if (!root) return 0;
  root.querySelector("#refundResults")?.classList.add("hidden");
  root.querySelector("#refundInfo")?.classList.remove("hidden");
  getElement("copyRefundSummaryBtn").disabled = true;
  getElement("printRefundReportBtn").disabled = true;
  getElement("calculatorValidationMessage").classList.add("hidden");
  return ++stateRevision;
}

let stateRevision = 0;

function getErrorMessage(payload: unknown): string {
  if (isRecord(payload) && Array.isArray(payload.fieldErrors)) {
    const errors = payload.fieldErrors
      .filter(
        (error): error is { message: string } =>
          isRecord(error) && typeof error.message === "string",
      )
      .map((error) => error.message);
    if (errors.length) return errors.join(" ");
  }
  return "Some ticket details are invalid. Review the fields and try again.";
}

function bindEvents(
  initialState: CalculatorFormState,
  initialSummary: CalculatorSummary,
): void {
  let state = initialState;
  let summary = initialSummary;
  let calculationPending = false;
  let normalizeRequestId = 0;
  let calculationRequestId = 0;
  let scenarioRequestId = 0;
  let timingRequestId = 0;
  let debounceTimer: number | undefined;

  const updateStateFromControls = () => {
    state = readFormState(state);
    return state;
  };

  const normalize = async (
    changedField: string,
    presetId: string | null = null,
    debounce = false,
  ) => {
    const revision = markResultsPending();
    const requestId = ++normalizeRequestId;
    state = updateStateFromControls();
    const send = async () => {
      try {
        const response = await fetch("/api/irctc-cancellation-refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "normalize",
            state,
            changedField,
            presetId,
          }),
        });
        const payload: unknown = await response.json().catch(() => null);
        if (requestId !== normalizeRequestId || revision !== stateRevision) return;
        if (!response.ok || !isRecord(payload) || !isRecord(payload.state) || !isSummary(payload.summary)) {
          showError(response.ok ? "The input service returned an unexpected response." : getErrorMessage(payload));
          return;
        }
        state = payload.state as unknown as CalculatorFormState;
        summary = payload.summary;
        applyState(state, summary);
        if (changedField === "toggleRuleRegime" || changedField === "ruleRegime") {
          void setTimingPreview();
        }
      } catch {
        if (requestId === normalizeRequestId && revision === stateRevision) {
          showError("Could not reach the calculator service. Check your connection and try again.");
        }
      }
    };
    if (debounce) {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => void send(), 140);
    } else {
      await send();
    }
  };

  const setTimingPreview = async (clearQuickTimeBand = false) => {
    const requestId = ++timingRequestId;
    const revision = stateRevision;
    const current = updateStateFromControls();
    if (clearQuickTimeBand) {
      current.quickTimeBandId = null;
      state.quickTimeBandId = null;
    }
    try {
      const response = await fetch("/api/irctc-cancellation-refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "timing-preview",
          ruleRegime: current.ruleRegime,
          cancellationDateTimeLocal: current.cancellationDateTimeLocal,
          departureDateTimeLocal: current.departureDateTimeLocal,
          timeZone: current.timeZone,
          quickTimeBandId: current.quickTimeBandId,
        }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (requestId !== timingRequestId || revision !== stateRevision) return;
      if (response.ok && isRecord(payload) && isTimingResult(payload.timing)) {
        applyTiming(payload.timing);
        summary = {
          ...summary,
          activeQuickTimeBandId: payload.timing.activeQuickTimeBandId,
        };
        refreshUIHighlights(state, summary);
      } else if (!current.cancellationDateTimeLocal && !current.departureDateTimeLocal) {
        setText("calculatedGapLabel", "Choose a time band or enter both train times.");
      } else {
        setText("calculatedGapLabel", "Enter both valid times to calculate the time before departure.");
        if (isRecord(payload) && Array.isArray(payload.fieldErrors)) {
          showError(getErrorMessage(payload));
        }
      }
    } catch {
      if (requestId === timingRequestId && revision === stateRevision) {
        setText("calculatedGapLabel", "Timing could not be calculated. Check your connection and try again.");
      }
    }
  };

  const setTimeBand = async (quickTimeBandId: string) => {
    const requestId = ++timingRequestId;
    const revision = markResultsPending();
    state = updateStateFromControls();
    try {
      const response = await fetch("/api/irctc-cancellation-refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "select-time-band",
          ruleRegime: state.ruleRegime,
          quickTimeBandId,
          timeZone: getBrowserTimeZone(),
        }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (requestId !== timingRequestId || revision !== stateRevision) return;
      if (!response.ok || !isRecord(payload) || !isTimingResult(payload.timing)) {
        showError(getErrorMessage(payload));
        return;
      }
      applyTiming(payload.timing);
      state = {
        ...state,
        timeZone: getBrowserTimeZone(),
        quickTimeBandId: payload.timing.quickTimeBandId,
        cancellationDateTimeLocal: payload.timing.cancellationDateTimeLocal,
        departureDateTimeLocal: payload.timing.departureDateTimeLocal,
      };
      summary = { ...summary, activeQuickTimeBandId: payload.timing.activeQuickTimeBandId };
      refreshUIHighlights(state, summary);
    } catch {
      if (requestId === timingRequestId) showError("Could not reach the timing service. Try again.");
    }
  };

  const applyTiming = (timing: RefundApiTiming) => {
    state.cancellationDateTimeLocal = timing.cancellationDateTimeLocal;
    state.departureDateTimeLocal = timing.departureDateTimeLocal;
    state.quickTimeBandId = timing.quickTimeBandId;
    getElement("cancelDateTime").value = timing.cancellationDateTimeLocal;
    getElement("departureDateTime").value = timing.departureDateTimeLocal;
    setText("calculatedGapLabel", timing.calculatedGapLabel);
  };

  const calculate = async () => {
    if (calculationPending) return;
    calculationPending = true;
    const revision = markResultsPending();
    const requestId = ++calculationRequestId;
    const button = getElement("calculateRefundBtn");
    const buttonText = getElement("calculateRefundButtonText");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    buttonText.textContent = "Calculating...";
    state = updateStateFromControls();
    const requestBody = { operation: "calculate", ...state };
    try {
      const response = await fetch("/api/irctc-cancellation-refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (requestId !== calculationRequestId || revision !== stateRevision) return;
      if (!response.ok) {
        showError(getErrorMessage(payload));
      } else if (!isRefundApiResult(payload)) {
        showError("The refund service returned an unexpected response. Please try again.");
      } else {
        applyTiming(payload.result.timing);
        renderRefundResult(payload.result);
        getElement("refundInfo").classList.add("hidden");
        getElement("refundResults").classList.remove("hidden");
        getElement("copyRefundSummaryBtn").disabled = false;
        getElement("printRefundReportBtn").disabled = false;
        getElement("refundResults").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch {
      if (requestId === calculationRequestId) {
        showError("Could not reach the refund service. Check your connection and try again.");
      }
    } finally {
      if (requestId === calculationRequestId) {
        calculationPending = false;
        button.disabled = false;
        button.removeAttribute("aria-busy");
        buttonText.textContent = "Calculate Refund";
      }
    }
  };

  const applyScenario = async (scenarioId: string) => {
    const requestId = ++scenarioRequestId;
    const revision = markResultsPending();
    try {
      const response = await fetch("/api/irctc-cancellation-refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "scenario",
          scenarioId,
          timeZone: getBrowserTimeZone(),
        }),
      });
      const payload: unknown = await response.json().catch(() => null);
      const timing = isRecord(payload) ? payload.timing : undefined;
      if (requestId !== scenarioRequestId || revision !== stateRevision) return;
      if (
        !response.ok ||
        !isRecord(payload) ||
        !isRecord(payload.state) ||
        !isSummary(payload.summary) ||
        !isTimingResult(timing)
      ) {
        showError(getErrorMessage(payload));
        return;
      }
      state = payload.state as unknown as CalculatorFormState;
      summary = {
        ...payload.summary,
        activeQuickTimeBandId: timing.activeQuickTimeBandId,
      };
      applyState(state, summary);
      applyTiming(timing);
      if (typeof payload.scenarioLabel === "string") {
        setText("activeTestBadge", payload.scenarioLabel);
      }
    } catch {
      if (requestId === scenarioRequestId && revision === stateRevision) {
        showError("Could not load this scenario. Try again.");
      }
    }
  };

  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(".source-btn") ?? []) {
    button.addEventListener("click", () => {
      state.bookingSource = button.dataset.source ?? "";
      void normalize("bookingSource");
    });
  }
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(".pay-btn") ?? []) {
    button.addEventListener("click", () => {
      state.paymentMethod = button.dataset.pay ?? "";
      void normalize("paymentMethod");
    });
  }
  getElement("togglePgBtn").addEventListener("click", () => {
    void normalize("togglePgEnabled");
  });
  getElement("toggleRoundingBtn").addEventListener("click", () => {
    void normalize("toggleRounding");
  });
  const setRegime = (ruleRegime: string) => {
    state.ruleRegime = ruleRegime;
    void normalize("ruleRegime");
  };
  getElement("toggleRuleRegimeBtn").addEventListener("click", () => {
    void normalize("toggleRuleRegime");
  });
  getElement("regimeActualBtn").addEventListener("click", () => setRegime("ACTUAL_48H"));
  getElement("regimeRumoredBtn").addEventListener("click", () => setRegime("VB_SLEEPER_72H"));
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(".class-btn") ?? []) {
    button.addEventListener("click", () => {
      state.travelClass = button.dataset.class ?? "";
      void normalize("travelClass");
    });
  }
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(".status-btn") ?? []) {
    button.addEventListener("click", () => {
      state.ticketStatus = button.dataset.status ?? "";
      void normalize("ticketStatus");
    });
  }
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(".slab-btn") ?? []) {
    button.addEventListener("click", () => void setTimeBand(button.dataset.timeBand ?? ""));
  }
  const invalidateTimingOnEdit = () => {
    markResultsPending();
    timingRequestId += 1;
  };
  getElement("cancelDateTime").addEventListener("input", invalidateTimingOnEdit);
  getElement("departureDateTime").addEventListener("input", invalidateTimingOnEdit);
  getElement("cancelDateTime").addEventListener("change", () => {
    markResultsPending();
    void setTimingPreview(true);
  });
  getElement("departureDateTime").addEventListener("change", () => {
    markResultsPending();
    void setTimingPreview(true);
  });
  getElement("setNowBtn").addEventListener("click", async () => {
    const revision = markResultsPending();
    const requestId = ++timingRequestId;
    try {
      const response = await fetch("/api/irctc-cancellation-refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "current-time", timeZone: getBrowserTimeZone() }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (requestId !== timingRequestId || revision !== stateRevision) return;
      if (!response.ok || !isRecord(payload) || typeof payload.currentDateTimeLocal !== "string") {
        showError(getErrorMessage(payload));
        return;
      }
      getElement("cancelDateTime").value = payload.currentDateTimeLocal;
      state.cancellationDateTimeLocal = payload.currentDateTimeLocal;
      state.quickTimeBandId = null;
      await setTimingPreview(true);
    } catch {
      if (requestId === timingRequestId && revision === stateRevision) {
        showError("Could not reach the timing service. Check your connection and try again.");
      }
    }
  });
  getElement("chartPreparedCheckbox").addEventListener("change", () => {
    state.chartPrepared = getElement("chartPreparedCheckbox").checked === true;
    void normalize("chartPrepared");
  });

  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(".total-pax-btn") ?? []) {
    button.addEventListener("click", () => {
      getElement("totalPassengersInput").value = button.dataset.totalpax ?? "";
      void normalize("totalPassengersRaw");
    });
  }
  getElement("totalPassengersInput").addEventListener("input", () => {
    void normalize("totalPassengersRaw", null, true);
  });
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(".cancel-pax-btn") ?? []) {
    button.addEventListener("click", () => {
      getElement("cancelPassengersInput").value = button.dataset.cancelpax ?? "";
      void normalize("cancelPassengersRaw");
    });
  }
  getElement("cancelPassengersInput").addEventListener("input", () => {
    void normalize("cancelPassengersRaw", null, true);
  });
  getElement("modeGrandTotalBtn").addEventListener("click", () => {
    state.fareInputMode = "GRAND_TOTAL";
    void normalize("fareInputMode");
  });
  getElement("modePureFareBtn").addEventListener("click", () => {
    state.fareInputMode = "PURE_FARE";
    void normalize("fareInputMode");
  });
  getElement("enteredGrandTotalInput").addEventListener("input", () => {
    void normalize("enteredTotalAmountRaw", null, true);
  });
  getElement("pureTotalFareInput").addEventListener("input", () => {
    void normalize("pureTotalFareEnteredRaw", null, true);
  });
  getElement("purePerPaxFareInput").addEventListener("input", () => {
    void normalize("purePerPaxFareEnteredRaw", null, true);
  });
  getElement("catYesBtn").addEventListener("click", () => {
    state.hasCatering = true;
    void normalize("hasCatering");
  });
  getElement("catNoBtn").addEventListener("click", () => {
    state.hasCatering = false;
    void normalize("hasCatering");
  });
  getElement("totalCateringInput").addEventListener("input", () => {
    void normalize("totalCateringFeeRaw", null, true);
  });
  getElement("perPaxCateringInput").addEventListener("input", () => {
    void normalize("perPaxCateringFeeRaw", null, true);
  });
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(".food-preset-btn") ?? []) {
    button.addEventListener("click", () => {
      void normalize("cateringPreset", button.dataset.cateringPresetId ?? "");
    });
  }
  getElement("insYesBtn").addEventListener("click", () => {
    state.hasInsurance = true;
    void normalize("hasInsurance");
  });
  getElement("insNoBtn").addEventListener("click", () => {
    state.hasInsurance = false;
    void normalize("hasInsurance");
  });
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(".ins-rate-btn") ?? []) {
    button.addEventListener("click", () => {
      void normalize("insurancePreset", button.dataset.insurancePresetId ?? "");
    });
  }
  getElement("customInsRateInput").addEventListener("input", () => {
    void normalize("insurancePerPaxRaw", null, true);
  });
  getElement("insRefundableCheckbox").addEventListener("change", () => {
    state.insuranceRefundable = getElement("insRefundableCheckbox").checked === true;
    void normalize("insuranceRefundable");
  });
  getElement("calculateRefundBtn").addEventListener("click", () => void calculate());
  for (const button of activeCalculatorRoot?.querySelectorAll<CalculatorElement>(".testcase-btn") ?? []) {
    button.addEventListener("click", () =>
      void applyScenario(button.dataset.testcase ?? ""),
    );
  }

  setText("calculatorValidationMessage", "");
  getElement("calculatorValidationMessage").classList.add("hidden");
}

function renderRefundResult(result: RefundApiResult): void {
  for (const id of refundDisplayFields) {
    getElement(id).textContent = result.display[id] ?? "—";
  }
  const comparisonNote = getElement("regimeComparisonNote");
  comparisonNote.textContent = result.display.regimeComparisonNote ?? "";
  comparisonNote.style.display = result.display.regimeComparisonNote ? "block" : "none";
  getElement("ruleExplanationAlert").className =
    `mt-4 rounded-xl border border-orange-100 p-3.5 ${alertToneClasses[result.alertTone]}`;
  getElement("stripPgFormulaLine").classList.toggle(
    "hidden",
    !result.visibility.stripPgFormulaLine,
  );
  getElement("receiptInsuranceRow").style.display =
    result.visibility.receiptInsuranceRow ? "flex" : "none";
  getElement("receiptAgentFeeRow").style.display =
    result.visibility.receiptAgentFeeRow ? "flex" : "none";
  getElement("receiptPgBaseRow").style.display =
    result.visibility.receiptPgBaseRow ? "flex" : "none";
  getElement("receiptPgFeeRow").style.display =
    result.visibility.receiptPgFeeRow ? "flex" : "none";
  getElement("receiptNetInsRefundRow").style.display =
    result.visibility.receiptNetInsRefundRow ? "flex" : "none";
}
