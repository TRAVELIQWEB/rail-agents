"use client";

import { useState, type FormEvent } from "react";
import { FileText, Lock, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "@/config/site";

function getInitialPrefilledQuery(): string {
  if (typeof window === "undefined") return "";
  const prefilled = new URLSearchParams(window.location.search).get("q")?.trim();
  return prefilled ? prefilled.slice(0, 500) : "";
}

export function QueryForm() {
  const [query, setQuery] = useState(getInitialPrefilledQuery);
  const [queryError, setQueryError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [handoffOpened, setHandoffOpened] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setQueryError("Please enter your question before continuing.");
      setHandoffOpened(false);
      document.getElementById("query-input")?.focus();
      return;
    }

    setQueryError("");
    setSubmitError("");
    setHandoffOpened(false);
    setIsSubmitting(true);

    const message = encodeURIComponent(
      `Hello, I have a question for your team.\n\nMy Query: ${cleanQuery}`,
    );
    const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${message}`;
    const chatWindow = window.open(whatsappUrl, "_blank");
    if (chatWindow) {
      chatWindow.opener = null;
      setHandoffOpened(true);
    } else {
      setSubmitError("Your browser blocked the WhatsApp window. Allow pop-ups and try again.");
    }
    window.setTimeout(() => setIsSubmitting(false), 400);
  }

  return (
    <div className="relative isolate w-full rounded-[32px] border border-[#fee4d0] bg-white p-5 shadow-[0_20px_50px_rgba(249,115,22,0.08),0_4px_16px_rgba(15,39,71,0.04)] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 -z-10 h-64 w-64 rounded-full bg-orange-100/60 blur-3xl"
      />

      <div className="mb-4 flex flex-col items-center gap-3 text-center md:flex-row md:items-start md:text-left">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f97316] to-[#ff8c38] text-white shadow-[0_6px_20px_rgba(249,115,22,0.3)]">
          <MessageCircle aria-hidden="true" className="h-5 w-5 fill-white/20 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#0f2747] sm:text-2xl">
            How can we help you?
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
            Write your question and connect directly with our agent on WhatsApp.
          </p>
        </div>
      </div>

      {handoffOpened ? (
        <div
          role="status"
          className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800"
        >
          WhatsApp opened with your query. Press Send in WhatsApp to contact RailAgents.
        </div>
      ) : null}
      {submitError ? (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {submitError}
        </p>
      ) : null}

      <form noValidate onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="query-input"
            className="mb-1.5 block text-sm font-bold text-[#0f2747]"
          >
            Your Query
          </label>
          <div className="relative rounded-2xl border border-slate-200/80 bg-[#fffdfa] p-3.5 shadow-inner transition-all focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-orange-100">
            <FileText
              aria-hidden="true"
              className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400"
            />
            <textarea
              id="query-input"
              name="query"
              required
              rows={4}
              maxLength={500}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setQueryError("");
              }}
              aria-invalid={Boolean(queryError)}
              aria-describedby={queryError ? "query-error query-count" : "query-count"}
              placeholder="Type your railway or travel question here..."
              className="h-32 min-h-[110px] max-h-[140px] w-full resize-y bg-transparent px-7 pb-5 pt-0 text-base leading-relaxed text-[#0f2747] outline-none placeholder:text-slate-400"
            />
            <span
              id="query-count"
              className="absolute bottom-2.5 right-3.5 select-none text-[11px] font-medium text-slate-400"
            >
              {query.length}/500
            </span>
          </div>
          {queryError ? (
            <p id="query-error" className="mt-1 text-xs text-red-700" role="alert">
              {queryError}
            </p>
          ) : null}
        </div>

        <div className="flex justify-center pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-[54px] w-full max-w-[320px] items-center justify-center gap-2.5 rounded-full border border-orange-200 bg-white px-3 text-sm font-extrabold text-[var(--primary-dark)] shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:shadow-[0_12px_22px_rgba(15,23,42,0.08)] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:cursor-wait disabled:opacity-70 sm:px-5 sm:text-base"
          >
            <span className="whitespace-nowrap">
              {isSubmitting ? "Opening WhatsApp..." : "Send Query on WhatsApp"}
            </span>
            <FaWhatsapp aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--primary-dark)]" />
          </button>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          <Lock aria-hidden="true" className="h-3.5 w-3.5" />
          Your query opens in WhatsApp; you choose when to send it.
        </p>
      </form>
    </div>
  );
}
