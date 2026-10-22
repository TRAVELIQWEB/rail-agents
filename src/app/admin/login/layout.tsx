import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal Sign In | RailAgents",
  description:
    "Secure authorized portal login for RailAgents content editors and administrators.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
