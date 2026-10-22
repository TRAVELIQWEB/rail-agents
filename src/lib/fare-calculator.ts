export type TicketCategory = "AC" | "NON_AC";

export interface TravelClass {
  code: string;
  name: string;
  category: TicketCategory;
  description: string;
  defaultIrctcFee: number;
  defaultAgentFee: number;
}

export const AC_CLASSES: TravelClass[] = [
  {
    code: "3A",
    name: "3-Tier AC Sleeper",
    category: "AC",
    description: "Most popular AC sleeper class with 3 tiers on each side.",
    defaultIrctcFee: 35.40,
    defaultAgentFee: 40,
  },
  {
    code: "2A",
    name: "2-Tier AC Sleeper",
    category: "AC",
    description: "Spacious air-conditioned berths with curtains and reading lights.",
    defaultIrctcFee: 35.40,
    defaultAgentFee: 40,
  },
  {
    code: "1A",
    name: "First AC (1st Class)",
    category: "AC",
    description: "Premium lockable 2-berth and 4-berth air-conditioned coupés.",
    defaultIrctcFee: 35.40,
    defaultAgentFee: 40,
  },
  {
    code: "3E",
    name: "3-Tier AC Economy",
    category: "AC",
    description: "Modern modular 3-tier coaches with optimized economy fares.",
    defaultIrctcFee: 35.40,
    defaultAgentFee: 40,
  },
  {
    code: "CC",
    name: "AC Chair Car",
    category: "AC",
    description: "Air-conditioned sitting coaches for daytime express trains.",
    defaultIrctcFee: 35.40,
    defaultAgentFee: 40,
  },
  {
    code: "EC",
    name: "Executive Chair Car",
    category: "AC",
    description: "Premium 2x2 spacious sitting on Shatabdi and Vande Bharat.",
    defaultIrctcFee: 35.40,
    defaultAgentFee: 40,
  },
  {
    code: "EA",
    name: "Anubhuti AC Class",
    category: "AC",
    description: "Ultra-luxury chair car with upgraded entertainment and seating.",
    defaultIrctcFee: 35.40,
    defaultAgentFee: 40,
  },
  {
    code: "EV",
    name: "Vistadome AC",
    category: "AC",
    description: "Scenic observation car with glass roof and rotatable seats.",
    defaultIrctcFee: 35.40,
    defaultAgentFee: 40,
  },
];

export const NON_AC_CLASSES: TravelClass[] = [
  {
    code: "SL",
    name: "Sleeper Class",
    category: "NON_AC",
    description: "Standard non-air-conditioned reserved sleeper berths.",
    defaultIrctcFee: 17.70,
    defaultAgentFee: 20,
  },
  {
    code: "2S",
    name: "Second Sitting",
    category: "NON_AC",
    description: "Reserved non-AC sitting accommodation for short & medium journeys.",
    defaultIrctcFee: 17.70,
    defaultAgentFee: 20,
  },
  {
    code: "GN",
    name: "General / 2S Non-AC",
    category: "NON_AC",
    description: "General second class reservation where applicable.",
    defaultIrctcFee: 17.70,
    defaultAgentFee: 20,
  },
  {
    code: "FC",
    name: "First Class (Non-AC)",
    category: "NON_AC",
    description: "Traditional non-AC first class cabins on select heritage routes.",
    defaultIrctcFee: 17.70,
    defaultAgentFee: 20,
  },
];

export const ALL_CLASSES: TravelClass[] = [...AC_CLASSES, ...NON_AC_CLASSES];

export interface PaymentGatewayConfig {
  thresholdAmount: number; // default: 2000
  percentageFeeBelowOrEqualThreshold: number; // 0.75% (i.e. 0.75)
  percentageFeeAboveThreshold: number; // 1.00% (i.e. 1.00)
  calculationBase: "RAILWAY_FARE" | "TOTAL_BEFORE_PG";
}

export const DEFAULT_PG_CONFIG: PaymentGatewayConfig = {
  thresholdAmount: 2000,
  percentageFeeBelowOrEqualThreshold: 0.75,
  percentageFeeAboveThreshold: 1.0,
  calculationBase: "TOTAL_BEFORE_PG",
};

export interface CalculatorFormState {
  adults: number;
  children: number;
  category: TicketCategory;
  travelClassCode: string;
  adultFare: string; // per adult fare (strictly manual)
  childFare?: string; // per child fare (strictly manual)
  railwayFare: string; // total base fare or custom
  irctcFee: string;
  agentFee: string;
  otherCharges: string;
  fareAlreadyIncludesFees: boolean;
  pgConfig: PaymentGatewayConfig;
}

export const INITIAL_CALCULATOR_STATE: CalculatorFormState = {
  adults: 1,
  children: 0,
  category: "AC",
  travelClassCode: "AC",
  adultFare: "",
  childFare: "",
  railwayFare: "0",
  irctcFee: "35.40",
  agentFee: "40",
  otherCharges: "0",
  fareAlreadyIncludesFees: false,
  pgConfig: DEFAULT_PG_CONFIG,
};

export interface CalculationResult {
  adults: number;
  children: number;
  totalPassengers: number;
  isPassengerCountValid: boolean;
  passengerWarning?: string;
  isFareValid: boolean;
  fareWarning?: string;

  category: TicketCategory;
  travelClass: TravelClass;

  adultFare: number;
  childFare: number;
  adultsTotalFare: number;
  childrenTotalFare: number;
  railwayFare: number; // combined base fare
  irctcFee: number;
  subtotalBeforePG: number; // Base + IRCTC Fee
  agentFee: number;
  otherCharges: number;
  pgCharge: number;
  pgAppliedRateDescription: string;
  finalTotalPayable: number;
  fareAlreadyIncludesFees: boolean;
  amountInWords: string;
}

/**
 * Calculates payment gateway charge according to exact business rules:
 * - If base fare <= threshold (2,000): 0.75% of base fare
 * - If base fare > threshold (2,000): 1.00% of base fare
 *
 * Uses accurate two-decimal rounding.
 */
export function calculatePGCharge(
  fare: number,
  config: PaymentGatewayConfig = DEFAULT_PG_CONFIG
): { charge: number; description: string } {
  if (fare <= 0) {
    return {
      charge: 0,
      description: "No fare entered",
    };
  }

  if (fare <= config.thresholdAmount) {
    const rawCharge = fare * (config.percentageFeeBelowOrEqualThreshold / 100);
    const charge = Math.round((rawCharge + Number.EPSILON) * 100) / 100;
    return {
      charge,
      description: `${config.percentageFeeBelowOrEqualThreshold}% (≤ ₹${config.thresholdAmount.toLocaleString("en-IN")})`,
    };
  }

  // Fare > threshold
  const rawCharge = fare * (config.percentageFeeAboveThreshold / 100);
  const charge = Math.round((rawCharge + Number.EPSILON) * 100) / 100;
  return {
    charge,
    description: `${config.percentageFeeAboveThreshold}% (> ₹${config.thresholdAmount.toLocaleString("en-IN")})`,
  };
}

/**
 * Perform complete fare calculation from form state
 */
export function calculateFare(state: CalculatorFormState): CalculationResult {
  const adults = Number.isInteger(state.adults) ? Math.max(0, state.adults) : 0;
  const children = Number.isInteger(state.children) ? Math.max(0, state.children) : 0;
  const totalPassengers = adults + children;

  let isPassengerCountValid = true;
  let passengerWarning: string | undefined = undefined;

  if (totalPassengers < 1) {
    isPassengerCountValid = false;
    passengerWarning = "At least 1 passenger is required.";
  } else if (totalPassengers > 6) {
    isPassengerCountValid = false;
    passengerWarning = `Maximum 6 passengers allowed (currently ${totalPassengers}).`;
  }

  // Parse adult fare (strictly manual input)
  const parsedAdultFare = parseFloat((state.adultFare || "").trim());
  const adultFare = isNaN(parsedAdultFare) || parsedAdultFare < 0 ? 0 : parsedAdultFare;

  // Parse child fare (strictly manual input - no automatic 50% fallback)
  const parsedChildFare = parseFloat((state.childFare || "").trim());
  const childFare = isNaN(parsedChildFare) || parsedChildFare < 0 ? 0 : parsedChildFare;

  const adultsTotalFare = adults * adultFare;
  const childrenTotalFare = children * childFare;

  // Base combined ticket fare: Total Railway Fare = (Adults × Adult Fare) + (Children × Child Fare)
  const railwayFare = adultsTotalFare + childrenTotalFare;

  let isFareValid = true;
  let fareWarning: string | undefined = undefined;

  if (railwayFare < 0) {
    isFareValid = false;
    fareWarning = "Fare cannot be negative.";
  }

  // If no base fare has been entered (railwayFare <= 0), zero out fees and total in Fare Summary
  const isZeroFare = railwayFare <= 0;

  // IRCTC fee: AC = 35.40, Non-AC = 17.70 (per ticket)
  const defaultIrctc = state.category === "AC" ? 35.40 : 17.70;
  const parsedIrctcFee = parseFloat((state.irctcFee || "").trim());
  const standardIrctcFee = isNaN(parsedIrctcFee) || parsedIrctcFee < 0 ? defaultIrctc : parsedIrctcFee;
  const irctcFee = isZeroFare ? 0 : standardIrctcFee;

  // Subtotal before PG charge = Base Railway Fare + IRCTC fee
  const subtotalBeforePG = isZeroFare
    ? 0
    : Math.round((railwayFare + irctcFee + Number.EPSILON) * 100) / 100;

  // Payment Gateway Charge calculated on Base Fare + IRCTC Fee (or base fare depending on config)
  const baseForPG =
    state.pgConfig.calculationBase === "TOTAL_BEFORE_PG" ? subtotalBeforePG : railwayFare;

  const { charge: pgCharge, description: pgAppliedRateDescription } = calculatePGCharge(
    baseForPG,
    state.pgConfig
  );

  // Agent Service Fee: AC = 40, Non-AC = 20
  const defaultAgent = state.category === "AC" ? 40 : 20;
  const parsedAgentFee = parseFloat((state.agentFee || "").trim());
  const standardAgentFee = isNaN(parsedAgentFee) || parsedAgentFee < 0 ? defaultAgent : parsedAgentFee;
  const agentFee = isZeroFare ? 0 : standardAgentFee;

  const parsedOtherCharges = parseFloat((state.otherCharges || "").trim());
  const otherCharges = isZeroFare || isNaN(parsedOtherCharges) || parsedOtherCharges < 0 ? 0 : parsedOtherCharges;

  // Final Total: Base Fare + IRCTC fee + PG charge + Agent service fee + Other charges
  const finalTotalPayable = isZeroFare
    ? 0
    : Math.round(
      (subtotalBeforePG + pgCharge + agentFee + otherCharges + Number.EPSILON) * 100
    ) / 100;

  // Find travel class details
  const travelClass =
    ALL_CLASSES.find((c) => c.code === state.travelClassCode) ||
    (state.category === "AC" ? AC_CLASSES[0] : NON_AC_CLASSES[0]);

  const amountInWords = isZeroFare ? "Zero Rupees Only" : numberToIndianWords(finalTotalPayable);

  return {
    adults,
    children,
    totalPassengers,
    isPassengerCountValid,
    passengerWarning,
    isFareValid,
    fareWarning,
    category: state.category,
    travelClass,
    adultFare,
    childFare,
    adultsTotalFare,
    childrenTotalFare,
    railwayFare,
    irctcFee,
    subtotalBeforePG,
    agentFee,
    otherCharges,
    pgCharge,
    pgAppliedRateDescription,
    finalTotalPayable,
    fareAlreadyIncludesFees: state.fareAlreadyIncludesFees,
    amountInWords,
  };
}

/**
 * Format currency in Indian standard formatting
 * e.g., 2020.75 -> ₹2,020.75
 */
export function formatINR(amount: number, showDecimals: boolean = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₹0.00";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Converts numbers into Indian currency English words
 * (Crores, Lakhs, Thousands, Hundreds, Rupees & Paise)
 */
export function numberToIndianWords(amount: number): string {
  if (isNaN(amount) || amount <= 0) {
    return "Zero Rupees Only";
  }

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertTwoDigits(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    const rem = n % 10;
    return `${tens[Math.floor(n / 10)]}${rem > 0 ? " " + ones[rem] : ""}`;
  }

  function convertThreeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    if (h > 0 && rest > 0) {
      return `${ones[h]} Hundred and ${convertTwoDigits(rest)}`;
    }
    if (h > 0) {
      return `${ones[h]} Hundred`;
    }
    return convertTwoDigits(rest);
  }

  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  if (rupees === 0 && paise === 0) {
    return "Zero Rupees Only";
  }

  let words = "";

  if (rupees > 0) {
    const crore = Math.floor(rupees / 10000000);
    let rem = rupees % 10000000;
    const lakh = Math.floor(rem / 100000);
    rem = rem % 100000;
    const thousand = Math.floor(rem / 1000);
    const hundredsAndBelow = rem % 1000;

    const parts: string[] = [];

    if (crore > 0) {
      parts.push(`${convertTwoDigits(crore)} Crore`);
    }
    if (lakh > 0) {
      parts.push(`${convertTwoDigits(lakh)} Lakh`);
    }
    if (thousand > 0) {
      parts.push(`${convertTwoDigits(thousand)} Thousand`);
    }
    if (hundredsAndBelow > 0) {
      parts.push(convertThreeDigits(hundredsAndBelow));
    }

    words = `${parts.join(" ")} Rupee${rupees === 1 ? "" : "s"}`;
  }

  if (paise > 0) {
    const paiseText = `${convertTwoDigits(paise)} Paise`;
    if (words) {
      words = `${words} and ${paiseText}`;
    } else {
      words = paiseText;
    }
  }

  return `${words} Only`.replace(/\s+/g, " ").trim();
}
