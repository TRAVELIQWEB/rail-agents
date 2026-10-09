import { Train } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[#fffdf9]/95 px-4 backdrop-blur-sm">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex flex-col items-center text-center"
      >
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-orange-100 border-t-[var(--primary)] motion-safe:animate-spin motion-reduce:animate-none" />
          <Train aria-hidden="true" className="h-7 w-7 text-[var(--navy)]" />
        </span>
        <span className="mt-4 text-base font-[800] tracking-[-0.02em] text-[var(--navy)]">
          RailAgents
        </span>
        <span className="mt-1 text-sm text-slate-600">
          Getting things ready...
        </span>
      </div>
    </div>
  );
}
