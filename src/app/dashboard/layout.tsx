// src/app/dashboard/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Mail,
  PlusCircle,
  Settings,
  Menu,
  X,
} from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'Enquiries', icon: Mail },
  { href: '/dashboard/listings', label: 'Listings', icon: PlusCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function NavLink({ href, label, Icon, onClick }: { href: string; label: string; Icon: any; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition
        ${active ? 'bg-red-50 text-[#D90429] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">

      {/* ── MOBILE DRAWER OVERLAY ─────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── MOBILE DRAWER ─────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <Link
            href="/"
            onClick={() => setDrawerOpen(false)}
            className="text-lg font-semibold text-[#D90429]"
          >
            ManxHive
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map(item => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              Icon={item.icon}
              onClick={() => setDrawerOpen(false)}
            />
          ))}
        </nav>
        <div className="absolute bottom-6 left-0 right-0 px-4">
          <Link
            href="/"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-center rounded-full border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* ── TOPBAR ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="text-xl font-semibold text-[#D90429]">ManxHive</Link>
          </div>
          <Link
            href="/"
            className="rounded-lg border px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      {/* ── PAGE BODY ─────────────────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1 rounded-2xl border p-3">
            {nav.map(item => (
              <NavLink key={item.href} href={item.href} label={item.label} Icon={item.icon} />
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
