// src/app/components/Header.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const categories = [
  'Cleaners','Electricians','Plumbers','Gardeners','Tutors',
  'Fitness Coaches','Barbers','Handymen','Driving Instructors',
];

const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

export default function Header() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-[#D90429]">
          ManxHive
        </Link>

        <nav className="relative flex items-center gap-3">
          <div className="relative">
            <button
              ref={btnRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg border px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
            >
              Categories <span className="ml-1 inline-block align-middle">▾</span>
            </button>

            {open && (
              <div
                ref={menuRef}
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border bg-white shadow-lg"
              >
                <div className="max-h-[320px] overflow-auto py-1">
                  {categories.map((name) => (
                    <Link
                      key={name}
                      role="menuitem"
                      href={`/categories/${toSlug(name)}`}
                      className="block px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                      onClick={() => setOpen(false)}
                    >
                      {name}
                    </Link>
                  ))}
                </div>
                <div className="border-t p-2">
                  <Link
                    href="/categories"
                    className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setOpen(false)}
                  >
                    View all categories →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* NEW: points to /dashboard */}
          <Link
            href="/dashboard"
            className="rounded-lg border border-[#D90429] px-3 py-1.5 text-sm font-medium text-[#D90429] hover:bg-red-50"
          >
            Provider Dashboard
          </Link>

          <Link
            href="/list-business"
            className="rounded-lg bg-[#D90429] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#BF0323]"
          >
            List Your Business
          </Link>
        </nav>
      </div>
    </header>
  );
}