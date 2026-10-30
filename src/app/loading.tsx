export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[#fffdfb]/95 px-4 backdrop-blur-sm">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Loading RailAgents"
        className="flex flex-col items-center justify-center text-center"
      >
        <div className="rail-capsule-loader">
          <span className="rail-capsule-text font-bold tracking-wider">loading</span>
          <span className="rail-capsule-bar" />
        </div>

        <div className="mt-6 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--navy)]/80">
            RailAgents
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
