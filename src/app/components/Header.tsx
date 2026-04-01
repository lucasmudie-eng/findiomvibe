// src/app/components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef, FormEvent } from "react";
import { createClient, type User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnon
    ? createClient(supabaseUrl, supabaseAnon)
    : null;

// ── NAV STRUCTURE ──────────────────────────────────────────────────────────────

type NavChild = { href: string; label: string; desc?: string };
type NavItem = { href: string; label: string; children?: NavChild[] };

const NAV_ITEMS: NavItem[] = [
  {
    href: "/whats-on",
    label: "What's On",
    children: [
      { href: "/whats-on", label: "All events", desc: "Everything happening on the island" },
      { href: "/whats-on?date=weekend", label: "This weekend", desc: "Friday to Sunday picks" },
      { href: "/whats-on?category=family", label: "Family & kids", desc: "Days out and activities" },
      { href: "/whats-on?category=sports", label: "Sports", desc: "Fixtures and competitions" },
      { href: "/whats-on?category=nightlife", label: "Nightlife & music", desc: "Gigs, bars and clubs" },
      { href: "/whats-on?category=community", label: "Community", desc: "Local gatherings and culture" },
    ],
  },
  {
    href: "/deals",
    label: "Deals",
    children: [
      { href: "/deals", label: "All deals", desc: "Every active offer island-wide" },
      { href: "/deals?category=food-drink", label: "Food & drink", desc: "Restaurants, cafes and bars" },
      { href: "/deals?category=shopping", label: "Shopping", desc: "Retail discounts and offers" },
      { href: "/deals?category=activities", label: "Activities", desc: "Things to do and experiences" },
      { href: "/deals?category=beauty-wellness", label: "Beauty & wellness", desc: "Salons, spas and health" },
      { href: "/deals?category=services", label: "Services", desc: "Trade and professional services" },
    ],
  },
  {
    href: "/businesses",
    label: "Businesses",
    children: [
      { href: "/businesses", label: "All businesses", desc: "Full local directory" },
      { href: "/businesses?category=food-drink", label: "Food & drink", desc: "Restaurants, cafes, takeaways" },
      { href: "/businesses?category=health-beauty", label: "Health & beauty", desc: "Salons, gyms and wellness" },
      { href: "/businesses?category=trades", label: "Trades & services", desc: "Builders, plumbers and more" },
      { href: "/list-business", label: "List your business", desc: "Add your business for free" },
    ],
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    children: [
      { href: "/marketplace", label: "Browse listings", desc: "Buy and sell locally" },
      { href: "/marketplace?category=property", label: "Property", desc: "Rentals and sales" },
      { href: "/marketplace?category=vehicles", label: "Vehicles", desc: "Cars, bikes and boats" },
      { href: "/marketplace?category=electronics", label: "Electronics", desc: "Tech and gadgets" },
      { href: "/marketplace?category=furniture", label: "Furniture & home", desc: "Household items" },
      { href: "/marketplace/create", label: "Sell something", desc: "List an item for free" },
    ],
  },
  {
    href: "/sports",
    label: "Sports",
    children: [
      { href: "/sports", label: "All sports", desc: "Every club and class on the island" },
      { href: "/sports/football", label: "Football", desc: "IOM Premier League and more" },
      { href: "/sports?type=rugby", label: "Rugby", desc: "Clubs and fixtures" },
      { href: "/sports?type=hockey", label: "Hockey", desc: "Teams and schedules" },
      { href: "/sports?type=athletics", label: "Athletics", desc: "Running clubs and events" },
      { href: "/list-sport", label: "Add a sport / class", desc: "List your club or class" },
    ],
  },
  {
    href: "/heritage",
    label: "Heritage",
    children: [
      { href: "/heritage", label: "Heritage places", desc: "Castles, glens and historic sites" },
      { href: "/heritage/walks", label: "Walks & routes", desc: "Guided walks across the island" },
      { href: "/community-spotlight", label: "Community spotlight", desc: "Stories from local people" },
      { href: "/list-walk", label: "Add a walk", desc: "Submit a walking route" },
    ],
  },
  {
    href: "/community-spotlight",
    label: "Community",
    children: [
      { href: "/community-spotlight", label: "Community spotlight", desc: "Stories and local voices" },
      { href: "/community", label: "Community hub", desc: "Events, groups and causes" },
      { href: "/whats-on?category=community", label: "Community events", desc: "Local gatherings near you" },
      { href: "/list-community-event", label: "List an event", desc: "Share your community event" },
    ],
  },
  { href: "/map", label: "Map" },
];

const listLinks = [
  { href: "/list-business", label: "List a business" },
  { href: "/marketplace/create", label: "List an item" },
  { href: "/list-event", label: "List an event" },
  { href: "/list-community-event", label: "List a community event" },
  { href: "/list-walk", label: "List a walk / route" },
  { href: "/list-sport", label: "List a sport / class" },
  { href: "/list-league", label: "List a league / club" },
];

const providerLinks = [
  { href: "/provider-dashboard", label: "Provider dashboard" },
  { href: "/list-business", label: "List a business" },
  { href: "/provider-help", label: "Provider help centre" },
];

// ── COMPONENT ──────────────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);

  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!supabase) { setUser(null); return; }

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      setUser(error ? null : (data.session?.user ?? null));
    }).catch(() => { if (isMounted) setUser(null); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => { isMounted = false; subscription.unsubscribe(); };
  }, []);

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    if (base === "/") return pathname === "/";
    return pathname === base || pathname?.startsWith(base + "/");
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const closeAll = () => {
    setActiveNav(null);
    setListOpen(false);
    setProviderOpen(false);
  };

  const openNav = (href: string) => {
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    setActiveNav(href);
    setListOpen(false);
    setProviderOpen(false);
  };

  const scheduleCloseNav = () => {
    navTimeoutRef.current = setTimeout(() => setActiveNav(null), 120);
  };

  const cancelCloseNav = () => {
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="flex w-full items-center gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">

        {/* LOGO — desktop left */}
        <Link
          href="/"
          className="hidden shrink-0 text-base font-semibold text-[#D90429] hover:text-[#b40320] md:inline-flex lg:text-lg"
        >
          ManxHive
        </Link>

        {/* CENTER: desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-0 text-[13px] font-medium md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const hasChildren = !!(item.children && item.children.length > 0);
            const isOpen = activeNav === item.href;

            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => hasChildren && openNav(item.href)}
                onMouseLeave={() => hasChildren && scheduleCloseNav()}
              >
                <Link
                  href={item.href}
                  onClick={closeAll}
                  className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-md px-2 py-1.5 transition-colors ${
                    active ? "text-[#D90429]" : "text-gray-700 hover:text-[#D90429]"
                  }`}
                >
                  {item.label}
                  {hasChildren && (
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </Link>

                {hasChildren && (
                  <div
                    className={`absolute left-0 top-full z-50 pt-1.5 transition-all duration-150 ${
                      isOpen
                        ? "opacity-100 pointer-events-auto translate-y-0"
                        : "opacity-0 pointer-events-none -translate-y-1"
                    }`}
                    onMouseEnter={cancelCloseNav}
                    onMouseLeave={scheduleCloseNav}
                  >
                    <div className="w-64 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-200/60">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={closeAll}
                          className="group flex flex-col px-4 py-2.5 hover:bg-slate-50"
                        >
                          <span className="text-sm font-medium text-slate-800 group-hover:text-[#D90429] transition-colors">
                            {child.label}
                          </span>
                          {child.desc && (
                            <span className="mt-0.5 text-[11px] text-slate-400">
                              {child.desc}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* MOBILE LOGO */}
        <Link
          href="/"
          className="text-base font-semibold text-[#D90429] hover:text-[#b40320] md:hidden"
        >
          ManxHive
        </Link>

        {/* RIGHT: desktop tools */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Link
            href="/contact"
            onClick={closeAll}
            className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Contact
          </Link>

          {/* LIST DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => { setListOpen(true); setProviderOpen(false); setActiveNav(null); }}
            onMouseLeave={() => setListOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              List
              <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${listOpen ? "rotate-180" : ""}`} />
            </button>
            <div
              className={`absolute right-0 top-full z-50 pt-1.5 transition-all duration-150 ${
                listOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-1"
              }`}
            >
              <div className="w-56 rounded-xl border border-slate-200 bg-white py-1.5 text-sm shadow-xl shadow-slate-200/60">
                {listLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeAll}
                    className="block px-4 py-2 text-gray-700 hover:bg-slate-50 hover:text-[#D90429]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* PROVIDER DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => { setProviderOpen(true); setListOpen(false); setActiveNav(null); }}
            onMouseLeave={() => setProviderOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Provider
              <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${providerOpen ? "rotate-180" : ""}`} />
            </button>
            <div
              className={`absolute right-0 top-full z-50 pt-1.5 transition-all duration-150 ${
                providerOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-1"
              }`}
            >
              <div className="w-56 rounded-xl border border-slate-200 bg-white py-1.5 text-sm shadow-xl shadow-slate-200/60">
                {providerLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeAll}
                    className="block px-4 py-2 text-gray-700 hover:bg-slate-50 hover:text-[#D90429]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ACCOUNT / LOGIN */}
          {user ? (
            <Link
              href="/account"
              onClick={closeAll}
              className="rounded-full bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={closeAll}
              className="rounded-full bg-[#D90429] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b40320]"
            >
              Log in / Sign up
            </Link>
          )}

          {/* SEARCH */}
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
              onFocus={() => setSearchExpanded(true)}
              onBlur={() => { if (!searchQuery.trim()) setSearchExpanded(false); }}
              placeholder={searchExpanded ? "Search the island..." : "Search"}
              className="w-full bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </form>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex items-center gap-1.5 md:hidden">
          <button
            type="button"
            onClick={() => router.push("/search")}
            className="inline-flex items-center justify-center rounded-full p-2 text-gray-700 hover:bg-gray-100"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={() => { setMobileOpen((v) => !v); closeAll(); }}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col pt-2 text-sm">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const hasChildren = !!(item.children && item.children.length > 0);
              const expanded = mobileExpanded === item.href;

              return (
                <div key={item.href}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex-1 rounded-lg px-2 py-2.5 font-medium transition-colors ${
                        active ? "text-[#D90429]" : "text-gray-700 hover:text-[#D90429]"
                      }`}
                    >
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => setMobileExpanded(expanded ? null : item.href)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasChildren && expanded && (
                    <div className="mb-1 ml-2 border-l-2 border-slate-100 pl-3">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 text-[13px] text-slate-600 hover:text-[#D90429]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <hr className="my-2 border-slate-100" />

            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-2 py-2.5 text-gray-700 hover:bg-gray-50"
            >
              Contact
            </Link>

            <div className="mt-1">
              <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                List something
              </p>
              {listLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2 py-2 text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-1">
              <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Provider tools
              </p>
              {providerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2 py-2 text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <hr className="my-2 border-slate-100" />

            {user ? (
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg bg-gray-900 px-2 py-2.5 text-center font-semibold text-white hover:bg-black"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg bg-[#D90429] px-2 py-2.5 text-center font-semibold text-white hover:bg-[#b40320]"
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
