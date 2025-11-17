"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { createClient, type User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnon
    ? createClient(supabaseUrl, supabaseAnon)
    : null;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setUser(null);
      return;
    }

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error) {
          setUser(null);
        } else {
          setUser(data.session?.user ?? null);
        }
      } catch {
        if (!isMounted) return;
        setUser(null);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    // removed Home – logo handles this
    { href: "/sports", label: "Sports" },
    { href: "/deals", label: "Deals" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/whats-on", label: "What’s On" },
    { href: "/businesses", label: "Businesses" },
    { href: "/community-spotlight", label: "Community" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(href + "/");
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSearchFocus = () => setSearchExpanded(true);
  const handleSearchBlur = () => {
    if (!searchQuery.trim()) setSearchExpanded(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Logo + desktop nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-semibold text-[#D90429] hover:text-[#b40320]"
          >
            ManxHive
          </Link>

          <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors whitespace-nowrap ${
                    active
                      ? "text-[#D90429]"
                      : "text-gray-700 hover:text-[#D90429]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: tools + account + search */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/list-business"
            className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            List business
          </Link>

          <Link
            href="/provider-dashboard"
            className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Provider dashboard
          </Link>

          {user ? (
            <Link
              href="/account"
              className="rounded-full bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#D90429] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b40320]"
            >
              Log in / Sign up
            </Link>
          )}

          {/* Expanding search pill */}
          <form
            onSubmit={handleSearchSubmit}
            className={`hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-sm transition-[width] duration-200 ease-out md:flex ${
              searchExpanded ? "w-56" : "w-24"
            }`}
          >
            <button
              type="submit"
              className="flex h-5 w-5 items-center justify-center text-gray-500 hover:text-[#D90429] focus:outline-none"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder={searchExpanded ? "Search the island…" : "Search"}
              className="w-full bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </form>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col space-y-3 pt-3 text-sm">
            {/* We keep mobile Home link here for convenience */}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-2 py-1.5 transition-colors ${
                isActive("/")
                  ? "text-[#D90429]"
                  : "text-gray-700 hover:bg-gray-50 hover:text-[#D90429]"
              }`}
            >
              Home
            </Link>

            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-2 py-1.5 transition-colors ${
                    active
                      ? "text-[#D90429]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[#D90429]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <hr className="my-2" />

            <Link
              href="/list-business"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-1.5 text-gray-700 hover:bg-gray-50"
            >
              List business
            </Link>

            <Link
              href="/provider-dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-1.5 text-gray-700 hover:bg-gray-50"
            >
              Provider dashboard
            </Link>

            {user ? (
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-gray-900 px-2 py-1.5 text-center font-semibold text-white hover:bg-black"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-[#D90429] px-2 py-1.5 text-center font-semibold text-white hover:bg-[#b40320]"
              >
                Log in / Sign up
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}