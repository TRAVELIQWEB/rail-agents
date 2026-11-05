import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PNR Status Check | RailAgents",
  description: "Understand Indian Railways PNR status terms and prepare to check your booking status.",
  alternates: { canonical: "/pnr-status" },
};

export default function PnrStatusLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
