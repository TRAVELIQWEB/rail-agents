import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PNR Status Lookup",
  description: "Check the latest status for your railway ticket PNR.",
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
  alternates: {
    canonical: "/pnr-status",
  },
  openGraph: {
    title: "PNR Status Lookup | RailAgents",
    description: "Check the latest status for your railway ticket PNR.",
    url: "/pnr-status",
  },
  twitter: {
    title: "PNR Status Lookup | RailAgents",
    description: "Check the latest status for your railway ticket PNR.",
  },
};

export default function PnrStatusLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
