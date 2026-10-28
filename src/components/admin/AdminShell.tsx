"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  Globe,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Continue anyway to clear client state
    }
    window.location.href = "/admin/login";
  };

  // Derive active page title & breadcrumbs
  const getPageInfo = () => {
    if (pathname === "/admin/dashboard") return { title: "Dashboard", crumb: "Overview" };
    if (pathname === "/admin/posts/new") return { title: "Create Post", crumb: "New Article" };
    if (pathname.includes("/edit")) return { title: "Edit Post", crumb: "Editor" };
    if (pathname.startsWith("/admin/posts")) return { title: "All Posts", crumb: "Article Management" };
    return { title: "Admin Portal", crumb: "Workspace" };
  };

  const pageInfo = getPageInfo();

  const renderNavItems = () => (
    <nav className="flex flex-col gap-1 px-3" aria-label="Admin Navigation">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active =
          href === "/admin/posts/new"
            ? pathname === "/admin/posts/new"
            : href === "/admin/posts"
            ? pathname === "/admin/posts" || (pathname.startsWith("/admin/posts/") && pathname !== "/admin/posts/new")
            : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
              active
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900"
            }`}
          >
            <Icon
              size={16}
              className={active ? "text-orange-400" : "text-slate-400 group-hover:text-slate-600"}
              strokeWidth={2}
            />
            <span>{label}</span>
            {active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-400" aria-hidden="true" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand Logo Header */}
      <div className="border-b border-slate-200/80 px-5 py-4">
        <Logo size="small" />
        <div className="mt-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-extrabold text-orange-700 border border-orange-200/80">
            <ShieldCheck size={11} className="text-orange-600" />
            Admin CMS
          </span>
          <span className="text-[10.5px] font-medium text-slate-400">RailAgents</span>
        </div>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto py-4">
        <p className="mb-2 px-5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Editorial Desk
        </p>
        {renderNavItems()}

        <p className="mb-2 mt-6 px-5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Public Site
        </p>
        <nav className="flex flex-col gap-1 px-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <Globe size={16} className="text-slate-400" strokeWidth={2} />
            <span>View Live Site</span>
            <ExternalLink size={12} className="ml-auto text-slate-400" />
          </a>
        </nav>
      </div>

      {/* Admin Profile & Logout */}
      <div className="border-t border-slate-200/80 p-4 space-y-2.5">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 p-2.5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <Image
              src="/images/nihal-singh.png"
              alt="Admin profile avatar"
              fill
              sizes="36px"
              className="object-cover object-top"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900">{email || "admin@railagents.in"}</p>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600">
              Authorized Editor
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-700 hover:border-red-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          <LogOut size={13} />
          <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-sans antialiased text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 flex-shrink-0 overflow-y-auto border-r border-slate-200/90 bg-white lg:flex lg:flex-col">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="text-sm font-black text-slate-900 tracking-tight">RailAgents CMS</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="icon-action p-1.5 text-slate-500"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200/90 bg-white px-4 sm:px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Open sidebar navigation"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb / Page Title */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-900 text-sm hidden sm:inline">{pageInfo.title}</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-slate-500 font-medium">{pageInfo.crumb}</span>
            </div>
          </div>

          {/* User Status Chip */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900">{email || "admin@railagents.in"}</span>
              <span className="text-[10px] font-medium text-emerald-600 flex items-center justify-end gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active Session
              </span>
            </div>
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-200 bg-orange-50 shadow-2xs">
              <Image
                src="/images/nihal-singh.png"
                alt="Profile"
                fill
                sizes="32px"
                className="object-cover object-top"
              />
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
