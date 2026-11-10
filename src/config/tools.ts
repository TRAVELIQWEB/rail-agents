export type RailToolId =
  | "live-train"
  | "pnr"
  | "fare"
  | "refund"
  | "ticket-date"
  | "chart";

export type RailTool = {
  id: RailToolId;
  title: string;
  shortTitle: string;
  href: string;
  description: string;
  badge: string;
  icon: "calculator" | "calendar" | "radio" | "ticket" | "train";
};

export const railTools: RailTool[] = [
  {
    id: "live-train",
    title: "Live Train Status",
    shortTitle: "Live Train Status",
    href: "/live-train-status",
    description: "Check a train’s reported running status, location, and station-by-station timings.",
    badge: "Live status",
    icon: "train",
  },
  {
    id: "pnr",
    title: "PNR Status Check",
    shortTitle: "PNR Status",
    href: "/pnr-status",
    description: "Check booking details, passenger status, and chart information.",
    badge: "PNR status",
    icon: "ticket",
  },
  {
    id: "fare",
    title: "Train Ticket Fare Calculator",
    shortTitle: "Fare Calculator",
    href: "/train-ticket-agent-fare-calculator",
    description: "Estimate train fares with an IRCTC and agent service fee breakdown.",
    badge: "Popular tool",
    icon: "calculator",
  },
  {
    id: "refund",
    title: "IRCTC Cancellation & Refund Calculator",
    shortTitle: "Refund Calculator",
    href: "/irctc-cancellation-refund-calculator",
    description: "Review PRS-based cancellation charges and estimated refunds.",
    badge: "PRS verified",
    icon: "calculator",
  },
  {
    id: "ticket-date",
    title: "IRCTC Ticket Date Calculator",
    shortTitle: "Ticket Date Calculator",
    href: "/ticket-date-calculator",
    description: "Find 60-day advance reservation and Tatkal booking opening dates.",
    badge: "Booking dates",
    icon: "calendar",
  },
  {
    id: "chart",
    title: "Train Chart Preparation Time",
    shortTitle: "Chart Preparation",
    href: "/train-chart-preparation-time",
    description: "Check station-wise first and second reservation chart timings.",
    badge: "Live PRS",
    icon: "radio",
  },
];

const toolAliases: Record<string, RailToolId> = {
  "live-train": "live-train",
  "live-train-status": "live-train",
  "live": "live-train",
  "pnr": "pnr",
  "pnr-status": "pnr",
  "fare": "fare",
  "fare-calculator": "fare",
  "train-ticket-agent-fare-calculator": "fare",
  "refund": "refund",
  "refund-calculator": "refund",
  "irctc-cancellation-refund-calculator": "refund",
  "ticket-date": "ticket-date",
  "ticket-date-calculator": "ticket-date",
  "date": "ticket-date",
  "chart": "chart",
  "chart-preparation": "chart",
  "train-chart-preparation-time": "chart",
};

export function findRailTool(param?: string | null): RailTool | null {
  if (!param) return null;
  const normalized = param.trim().toLowerCase().replace(/^\/+/, "");
  const matchedId = toolAliases[normalized];
  if (matchedId) {
    return railTools.find((tool) => tool.id === matchedId) ?? null;
  }
  return null;
}

export function resolveRailTool(param?: string | null): RailTool {
  return findRailTool(param) ?? railTools[0];
}
