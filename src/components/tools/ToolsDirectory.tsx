"use client";

import { useState } from "react";
import { ArrowRight, Calculator, CalendarDays, Clock3, Search, Ticket, TrainFront, Undo2, X } from "lucide-react";
import { railTools, type RailToolId } from "@/config/tools";
import { InternalLink } from "@/components/ui/InternalLink";
import styles from "./ToolsDirectory.module.css";

const icons = {
  "live-train": TrainFront,
  pnr: Ticket,
  chart: Clock3,
  fare: Calculator,
  refund: Undo2,
  "ticket-date": CalendarDays,
};

const categories: { id: string; title: string; description: string; tools: RailToolId[] }[] = [
  { id: "journey", title: "Track your journey", description: "Running updates, ticket status and reservation charts.", tools: ["live-train", "pnr", "chart"] },
  { id: "booking", title: "Plan your booking", description: "Make sense of fares, refunds and booking dates.", tools: ["fare", "refund", "ticket-date"] },
];

export function ToolsDirectory({ embedded = false }: { embedded?: boolean }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchingTools = railTools.filter((tool) => `${tool.title} ${tool.shortTitle}`.toLocaleLowerCase().includes(normalizedQuery));

  return (
    <div className={`${styles.directory} ${embedded ? styles.embedded : ""}`}>
      <section className={styles.hero} aria-labelledby="railway-tools-title">
        <div className={styles.container}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <InternalLink href="/">Home</InternalLink><span aria-hidden="true">/</span><span aria-current="page">Railway tools</span>
          </nav>
          <p className={styles.eyebrow}><TrainFront aria-hidden="true" size={16} /> YOUR RAILWAY TOOLKIT</p>
          <h1 id="railway-tools-title">Railway Tools <span>&amp; Calculators</span></h1>
          <p className={styles.intro}>From checking your train to planning your next booking, find the right railway tool in one place.</p>
          <div className={styles.search}>
            <Search aria-hidden="true" size={19} />
            <label htmlFor="railway-tool-search" className="sr-only">Find a tool by name</label>
            <input id="railway-tool-search" type="search" placeholder="Search tools, e.g. PNR, Fare..." value={query} onChange={(event) => setQuery(event.target.value)} aria-controls="railway-tool-results" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear tool search"><X aria-hidden="true" size={18} /></button>}
          </div>
          <div className={styles.shortcuts}>
            <span className={styles.shortcutsLabel}>Explore</span>
            <div className={styles.shortcutsList}>
              {categories.map((category) => (
                <a key={category.id} href={`#tools-${category.id}`}>
                  {category.title}
                  <ArrowRight aria-hidden="true" size={12} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className={styles.container} id="railway-tool-results">
        <div className={styles.resultsHeader}>
          <p>Practical tools. Clear answers.</p>
          <span role="status" aria-live="polite" aria-atomic="true">{matchingTools.length} of {railTools.length} tools{normalizedQuery ? " found" : " available"}</span>
        </div>
        {categories.map((category) => {
          const tools = category.tools.flatMap((id) => matchingTools.filter((tool) => tool.id === id));
          return (
            <section key={category.id} id={`tools-${category.id}`} className={styles.category} aria-labelledby={`tools-${category.id}-title`}>
              <div className={styles.categoryHeading}>
                <h2 id={`tools-${category.id}-title`}>{category.title}</h2>
                <p>{category.description}</p>
              </div>
              {tools.length > 0 ? <div className={styles.grid}>
                {tools.map((tool) => {
                  const Icon = icons[tool.id];
                  return (
                    <InternalLink key={tool.id} href={tool.href} prefetch={false} className={styles.card} aria-label={`Use ${tool.title}`}>
                      <div className={styles.cardTop}><span className={styles.icon}><Icon aria-hidden="true" size={24} strokeWidth={1.8} /></span><span className={styles.toolType}>{category.id === "journey" ? "Journey tool" : "Calculator"}</span></div>
                      <h3>{tool.title}</h3>
                      <p>{tool.description}</p>
                      <span className={styles.action}>Use Tool <ArrowRight aria-hidden="true" size={17} /></span>
                    </InternalLink>
                  );
                })}
              </div> : <p className={styles.emptyCategory}>No matching tools in this category.</p>}
            </section>
          );
        })}
        {matchingTools.length === 0 && <div className={styles.empty}><Search aria-hidden="true" size={24} /><h2>No tools found</h2><p>Try a tool name such as “train”, “PNR” or “refund”.</p><button type="button" onClick={() => setQuery("")}>Show all tools <ArrowRight aria-hidden="true" size={16} /></button></div>}
        <p className={styles.note}><Clock3 aria-hidden="true" size={16} /> Live results depend on provider availability. Calculator results are estimates; review the guidance in each tool.</p>
      </div>
    </div>
  );
}
