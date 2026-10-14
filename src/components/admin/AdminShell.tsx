"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/posts", icon: FileText, label: "All Posts" },
  { href: "/admin/posts/new", icon: PenSquare, label: "Create Post" },
];

interface AdminShellProps {
  children: React.ReactNode;
  email?: string;
}

export function AdminShell({ children, email }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const renderNavItems = () => (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
              active
                ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon size={18} strokeWidth={2} />
            {label}
            {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
          </Link>
        );
      })}
    </nav>
  );

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-slate-100 px-5 py-4">
        <Logo size="small" />
        <p className="ml-10 mt-1 text-[10px] text-slate-500">Publishing workspace</p>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4">
        <p className="mb-2 px-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Content
        </p>
        {renderNavItems()}

        <p className="mb-2 mt-6 px-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Site
        </p>
        <nav className="flex flex-col gap-1 px-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <ImageIcon size={18} strokeWidth={2} />
            View Public Site
          </a>
        </nav>
      </div>

      {/* Admin Profile + Logout */}
      <div className="border-t border-slate-100 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-orange-50">
            <Image src="/images/nihal-singh.png" alt="Nihal Singh" fill sizes="32px" className="object-cover object-top" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-800">{email ?? "Admin"}</p>
            <p className="text-[10px] text-slate-500">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          <LogOut size={16} />
          {loggingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white lg:flex lg:flex-col">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r border-slate-200 bg-white shadow-xl lg:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="text-sm font-black text-slate-900">RailAgents Admin</span>
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            {renderSidebarContent()}
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold text-slate-500 sm:block">
              {email}
            </span>
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-200 bg-orange-50">
              <Image src="/images/nihal-singh.png" alt="Nihal Singh" fill sizes="32px" className="object-cover object-top" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

