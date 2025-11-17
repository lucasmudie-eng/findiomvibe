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
} from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'Enquiries', icon: Mail },
  { href: '/dashboard/listings', label: 'Listings', icon: PlusCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function NavLink({ href, label, Icon }: { href: string; label: string; Icon: any }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition
        ${active ? 'bg-red-50 text-[#D90429] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-semibold text-[#D90429]">ManxHive</Link>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 md:hidden"
              onClick={() => setOpen(v => !v)}
              aria-label="Toggle navigation"
            >
              Menu
            </button>
            <Link
              href="/"
              className="hidden rounded-lg border px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 md:inline-block"
            >
              Back to site
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className={`${open ? 'block' : 'hidden'} md:block`}>
          <nav className="space-y-1 rounded-2xl border p-3">
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