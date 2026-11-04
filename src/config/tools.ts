export type RailTool = {
  title: string;
  href: string;
  description: string;
  badge: string;
  icon: "calculator" | "calendar" | "radio" | "ticket";
};

export const railTools: RailTool[] = [
  {
    title: "Train Ticket Fare Calculator",
    href: "/train-ticket-agent-fare-calculator",
    description: "Estimate train fares with an IRCTC and agent service fee breakdown.",
    badge: "Popular tool",
    icon: "calculator",
  },
  {
    title: "IRCTC Cancellation & Refund Calculator",
    href: "/irctc-cancellation-refund-calculator",
    description: "Review PRS-based cancellation charges and estimated refunds.",
    badge: "PRS verified",
    icon: "calculator",
  },
  {
    title: "IRCTC Ticket Date Calculator",
    href: "/ticket-date-calculator",
    description: "Find 60-day advance reservation and Tatkal booking opening dates.",
    badge: "Booking dates",
    icon: "calendar",
  },
  {
    title: "Train Chart Preparation Time",
    href: "/train-chart-preparation-time",
    description: "Check station-wise first and second reservation chart timings.",
    badge: "Live PRS",
    icon: "radio",
  },
  {
    title: "PNR Status Check",
    href: "/pnr-status",
    description: "Check booking details, passenger status, and chart information.",
    badge: "PNR status",
    icon: "ticket",
  },
];
