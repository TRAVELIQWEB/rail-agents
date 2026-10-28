import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-16">
      <div className="site-container text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0df] text-[var(--primary)] shadow-sm">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="page-hero-title mt-6">
          Page Not Found
        </h1>
        <p className="page-hero-description mx-auto mt-3 max-w-[440px]">
          The page you are looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-[600] text-white shadow-md transition hover:bg-[var(--primary-hover)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
