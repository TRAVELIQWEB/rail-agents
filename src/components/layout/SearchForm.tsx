"use client";

import { useState, type FormEvent } from "react";
import { Search, ArrowRight } from "lucide-react";

type SearchFormProps = {
  mobile?: boolean;
};

export function SearchForm({ mobile = false }: SearchFormProps) {
  const [query, setQuery] = useState("");
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`flex min-h-[42px] items-center gap-2 rounded-full border border-[#f0deca] bg-white px-3.5 py-1.5 shadow-[0_2px_8px_rgba(15,39,71,0.04)] transition-all duration-200 hover:border-[#fdba74] ${
        mobile ? "w-full" : "w-[120px] min-[1280px]:w-[170px] 2xl:w-[220px] wide:w-[270px]"
      } focus-within:border-[var(--primary)] focus-within:shadow-[0_0_12px_rgba(249,115,22,0.2)]`}
    >
      <Search className="h-4 w-4 shrink-0 text-slate-400" />
      <input
        aria-label="Search guides, videos, or questions"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search guides, videos..."
        className="min-w-0 flex-1 border-0 bg-transparent text-base text-[var(--navy)] outline-none placeholder:text-slate-400 focus-visible:ring-0"
      />
      <button
        type="submit"
        aria-label="Submit search"
        aria-disabled="true"
        title="Search is coming soon"
        disabled
        className="flex h-6 w-6 shrink-0 cursor-not-allowed items-center justify-center text-[#f97316]"
      >
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}
