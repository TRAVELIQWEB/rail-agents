import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read the Terms and Conditions for using RailAgents, including educational use guidelines, independent railway guidance disclaimers, and our fictional character and brand identity disclosure.",
  alternates: { canonical: `${siteConfig.url}/terms` },
  openGraph: {
    title: "Terms and Conditions | RailAgents",
    description:
      "Read the Terms and Conditions for using RailAgents, including educational use guidelines, independent disclaimers, and brand identity disclosures.",
    url: `${siteConfig.url}/terms`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms and Conditions | RailAgents",
    description:
      "Read the Terms and Conditions for using RailAgents, including educational use guidelines, independent disclaimers, and brand identity disclosures.",
    images: [siteConfig.socialImage],
  },
};

export default function TermsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteConfig.url}/terms#webpage`,
        url: `${siteConfig.url}/terms`,
        name: "Terms and Conditions | RailAgents",
        description:
          "Terms and Conditions governing the use of the RailAgents website, educational guides, calculators, and fictional brand identity disclosure.",
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        publisher: { "@id": `${siteConfig.url}/#organization` },
        breadcrumb: { "@id": `${siteConfig.url}/terms#breadcrumb` },
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteConfig.url}/terms#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Terms and Conditions",
            item: `${siteConfig.url}/terms`,
          },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfb] text-[var(--navy)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />

      <main id="main-content" tabIndex={-1} className="relative flex-1">
        {/* Hero Banner */}
        <section className="relative overflow-hidden border-b border-[#f4e4d4] bg-gradient-to-b from-[#fffaf4] via-[#fffdfa] to-white py-10 sm:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-orange-100/60 blur-3xl"
          />
          <div className="site-container relative z-10 max-w-4xl">
            <div className="type-caption mb-3 inline-flex items-center gap-2 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-1 font-bold uppercase tracking-wider text-[#F36B21]">
              <Scale className="h-3.5 w-3.5 text-[#F36B21]" />
              Legal &amp; Platform Terms
            </div>
            <h1 className="type-page-title page-hero-title">
              Terms and <span className="hero-accent">Conditions</span>
            </h1>
            <p className="type-hero-description page-hero-description mt-3 max-w-2xl">
              Please review the terms governing your access to and use of the RailAgents website, educational guides, and informational tools.
            </p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-10 sm:py-14 lg:py-16">
          <div className="site-container max-w-4xl space-y-6">

            {/* 1. Independent Educational Platform */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#F36B21]">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <h2 className="type-h2  text-[var(--navy)] ">
                  1. Independent Educational Platform &amp; Non-Affiliation
                </h2>
              </div>
              <div className="type-body-small mt-4 space-y-3 leading-relaxed text-slate-600 sm:leading-7">
                <p className="type-body">
                  RailAgents (<Link href="/" className="font-semibold text-[#F36B21] hover:underline">railagents.in</Link>) is an independent educational and informational website created to help railway ticketing agents and passengers understand general railway booking procedures, compliance standards, and public travel rules.
                </p>
                <p className="type-body">
                  RailAgents is not affiliated with, endorsed by, sponsored by, or connected to Indian Railways, the Indian Railway Catering and Tourism Corporation (IRCTC), the Centre for Railway Information Systems (CRIS), the Ministry of Railways, or any government entity. We do not issue official agent credentials, sell railway tickets directly, or act as a government regulatory authority.
                </p>
              </div>
            </div>

            {/* 2. Fictional Character and Brand Identity */}
            <div className="rounded-2xl border border-[#fed7aa] bg-[#fffdfa] p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#F36B21]">
                  <UserCheck className="h-5 w-5" />
                </span>
                <h3 className="type-h3  text-[var(--navy)] ">
                  Fictional Character and Brand Identity
                </h3>
              </div>
              <div className="type-body-small mt-4 leading-relaxed text-slate-600 sm:leading-7">
                <p className="type-body">
                  Nihal Singh is a fictional digital character and brand identity created for RailAgents. The character does not represent a real individual, railway employee, government official, or authorized representative of Indian Railways. The RailAgents platform is managed and maintained by real human platform administrators. Content presented through Nihal Singh is part of the RailAgents platform and should not be interpreted as the independent statements, personal experiences, or professional credentials of an actual individual.
                </p>
              </div>
            </div>

            {/* 3. Informational Use & Verification */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#F36B21]">
                  <FileText className="h-5 w-5" />
                </span>
                <h2 className="type-h2  text-[var(--navy)] ">
                  3. Informational Use &amp; Official Rule Verification
                </h2>
              </div>
              <div className="type-body-small mt-4 space-y-3 leading-relaxed text-slate-600 sm:leading-7">
                <p className="type-body">
                  All articles, guides, videos, calculators, and status tools on RailAgents are provided strictly for general informational and educational purposes. Railway rules, advance reservation periods, Tatkal timings, cancellation charges, refund policies, and Principal Service Provider (PSP) terms are subject to change by Indian Railways, IRCTC, and authorized providers without prior notice.
                </p>
                <p className="type-body">
                  Users and ticketing agents are solely responsible for verifying current rules, tariff slabs, and contractual terms directly with official railway sources (<span className="font-medium text-slate-700">irctc.co.in</span> / <span className="font-medium text-slate-700">indianrail.gov.in</span>) or their authorized Principal Service Provider before taking commercial or travel decisions.
                </p>
              </div>
            </div>

            {/* 4. No Guarantees & Limitation of Liability */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#F36B21]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 className="type-h2  text-[var(--navy)] ">
                  4. No Guarantees, Credential Safety &amp; Limitation of Liability
                </h2>
              </div>
              <div className="type-body-small mt-4 space-y-3 leading-relaxed text-slate-600 sm:leading-7">
                <p className="type-body">
                  RailAgents makes no representations or warranties regarding confirmed ticket reservations, waitlist predictions, agent onboarding approvals, business outcomes, or specific refund amounts. Calculators and informational tools provide estimates based on publicly documented rules and do not constitute official receipts or binding quotes.
                </p>
                <p className="type-body">
                  RailAgents will never request your IRCTC account passwords, booking OTPs, or banking credentials. Under no circumstances shall RailAgents or its operator be liable for any direct, indirect, incidental, or consequential loss arising from the use of or reliance upon information provided on this website.
                </p>
              </div>
            </div>

            {/* Bottom Contact Prompt */}
            <div className="rounded-2xl border border-[#f2d9bf] bg-[#fff8f2] p-5 sm:p-6 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
              <div>
                <p className="type-body  font-extrabold text-[var(--navy)]">
                  Questions regarding our platform terms or disclosures?
                </p>
                <p className="type-body-small mt-1 text-slate-600">
                  Learn more on our <Link href="/about" className="font-semibold text-[#F36B21] underline">About page</Link> or contact us directly.
                </p>
              </div>
              <Link
                href="/contact"
                className="type-button mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2 font-bold text-white shadow-xs transition-colors hover:bg-[#F36B21] sm:mt-0"
              >
                Contact Us
              </Link>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

