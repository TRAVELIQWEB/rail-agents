import Link from "next/link";

export function AllToolsLink() {
  return (
    <nav aria-label="Railway tools" className="site-tool-container py-3">
      <Link href="/tools" className="type-button inline-flex rounded font-medium text-[#0F2747] transition-colors hover:text-[#C6530A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F36B21]">
        <span aria-hidden="true" className="mr-1.5">←</span>All Railway Tools
      </Link>
    </nav>
  );
}
