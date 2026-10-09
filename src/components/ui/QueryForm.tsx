"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  ChevronDown,
  FileText,
  Lock,
  MessageCircle,
  Phone,
  SendHorizontal,
  UserRound,
} from "lucide-react";
import { siteConfig } from "@/config/site";

type FieldErrors = Partial<Record<"name" | "mobile" | "query", string>>;

export function QueryForm() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [query, setQuery] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [handoffOpened, setHandoffOpened] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    const cleanName = name.trim();
    const cleanQuery = query.trim();

    if (!cleanName) nextErrors.name = "Please enter your name.";
    else if (cleanName.length > 80) nextErrors.name = "Name must be 80 characters or fewer.";
    if (!/^\d{10}$/.test(mobile)) nextErrors.mobile = "Enter a valid 10-digit Indian mobile number.";
    if (cleanQuery.length < 10) nextErrors.query = "Please enter at least 10 characters.";
    else if (cleanQuery.length > 500) nextErrors.query = "Your query must be 500 characters or fewer.";

    setErrors(nextErrors);
    setSubmitError("");
    setHandoffOpened(false);
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidField = ["name", "mobile", "query"].find(
        (field) => nextErrors[field as keyof FieldErrors],
      );
      if (firstInvalidField) {
        document.getElementById(`${firstInvalidField}-input`)?.focus();
      }
      return;
    }

    const message = encodeURIComponent(
      `Hi RailAgents,\n\nMy name is ${cleanName} and my mobile number is ${mobile}.\n\nMy travel-related question is:\n${cleanQuery}\n\nPlease guide me with the next steps.`,
    );
    const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${message}`;

    setIsSubmitting(true);
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
    <div className="relative isolate w-full rounded-[32px] border border-[#fee4d0] bg-white p-6 shadow-[0_20px_50px_rgba(249,115,22,0.08),0_4px_16px_rgba(15,39,71,0.04)] sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 -z-10 h-64 w-64 rounded-full bg-orange-100/60 blur-3xl" />

      <div className="mb-6 flex flex-col items-center gap-3 text-center md:flex-row md:items-start md:gap-4 md:text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f97316] to-[#ff8c38] text-white shadow-[0_6px_20px_rgba(249,115,22,0.3)]">
          <MessageCircle aria-hidden="true" className="h-6 w-6 fill-white/20 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#0f2747] sm:text-2xl">Tell us how we can help</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">Share your question and our team will be ready to guide you.</p>
        </div>
      </div>

      {handoffOpened ? (
        <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800">
          WhatsApp opened with your query. Press Send in WhatsApp to contact RailAgents.
        </div>
      ) : null}
      {submitError ? (
        <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</p>
      ) : null}

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name-input" className="mb-1.5 block text-sm font-bold text-[#0f2747]">Name</label>
          <div className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-slate-200/80 bg-[#fffdfa] px-4 py-2.5 shadow-inner transition-all focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-orange-100">
            <UserRound aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              id="name-input"
              name="name"
              autoComplete="name"
              required
              maxLength={80}
              value={name}
              onChange={(event) => { setName(event.target.value); setErrors((current) => ({ ...current, name: undefined })); }}
              onBlur={() => setName((current) => current.trim())}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              placeholder="Your full name"
              className="w-full min-w-0 bg-transparent text-base text-[#0f2747] outline-none placeholder:text-slate-400"
            />
          </div>
          {errors.name ? <p id="name-error" className="mt-1 text-xs text-red-700">{errors.name}</p> : null}
        </div>

        <div>
          <label htmlFor="mobile-input" className="mb-1.5 block text-sm font-bold text-[#0f2747]">Mobile Number</label>
          <div className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-slate-200/80 bg-[#fffdfa] px-4 py-2.5 shadow-inner transition-all focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-orange-100">
            <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
            <div aria-hidden="true" className="flex shrink-0 items-center gap-1 border-r border-slate-200 pr-2.5 text-xs font-bold text-slate-600">
              <span>+91</span><ChevronDown className="h-3 w-3 text-slate-400" />
            </div>
            <input
              id="mobile-input"
              name="mobile"
              autoComplete="tel-national"
              type="tel"
              inputMode="numeric"
              required
              pattern="[0-9]{10}"
              maxLength={10}
              value={mobile}
              onChange={(event) => {
                const enteredDigits = event.target.value.replace(/\D/g, "");
                const localDigits = enteredDigits.startsWith("91") && enteredDigits.length > 10
                  ? enteredDigits.slice(2)
                  : enteredDigits;
                setMobile(localDigits.slice(0, 10));
                setErrors((current) => ({ ...current, mobile: undefined }));
              }}
              aria-invalid={Boolean(errors.mobile)}
              aria-describedby={errors.mobile ? "mobile-error" : undefined}
              placeholder="Your mobile number"
              className="w-full min-w-0 bg-transparent text-base text-[#0f2747] outline-none placeholder:text-slate-400"
            />
          </div>
          {errors.mobile ? <p id="mobile-error" className="mt-1 text-xs text-red-700">{errors.mobile}</p> : null}
        </div>

        <div>
          <label htmlFor="query-input" className="mb-1.5 block text-sm font-bold text-[#0f2747]">Your Query</label>
          <div className="relative flex rounded-2xl border border-slate-200/80 bg-[#fffdfa] p-3.5 shadow-inner transition-all focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-orange-100">
            <FileText aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <textarea
              id="query-input"
              name="query"
              required
              rows={4}
              minLength={10}
              maxLength={500}
              value={query}
              onChange={(event) => { setQuery(event.target.value); setErrors((current) => ({ ...current, query: undefined })); }}
              aria-invalid={Boolean(errors.query)}
              aria-describedby={errors.query ? "query-error" : "query-count"}
              placeholder="Write your question here..."
              className="ml-3 min-h-[110px] min-w-0 flex-1 resize-y bg-transparent text-base leading-relaxed text-[#0f2747] outline-none placeholder:text-slate-400"
            />
            <span id="query-count" className="absolute bottom-2.5 right-3.5 select-none text-[11px] font-medium text-slate-400">{query.length}/500</span>
          </div>
          {errors.query ? <p id="query-error" className="mt-1 text-xs text-red-700">{errors.query}</p> : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group mt-2 inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#ff5500] via-[#f97316] to-[#ea580c] px-6 py-3.5 text-base font-bold text-white shadow-[0_8px_24px_rgba(249,115,22,0.35)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_12px_30px_rgba(249,115,22,0.45)] active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:cursor-wait disabled:opacity-75"
        >
          <SendHorizontal aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          {isSubmitting ? "Opening WhatsApp..." : "Send your query"}
          <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        <p className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          <Lock aria-hidden="true" className="h-3.5 w-3.5" />
          Your query opens in WhatsApp; you choose when to send it.
        </p>
      </form>
    </div>
  );
}
