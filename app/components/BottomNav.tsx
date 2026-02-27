"use client";

import Link from "next/link";
import { IconCart, IconSearch, IconUser } from "./Icons";
import { safeHref } from "@/lib/urlValidation";

const FALLBACK_NAV = [
  { href: "/", label: "Home" },
  { href: "#shop", label: "Shop" },
  { href: "#calendar", label: "Calendar" },
  { href: "#contact", label: "Contact" },
];

export function BottomNav({
  navLinks,
}: {
  navLinks?: Array<{ label?: string; href?: string }>;
}) {
  const nav = navLinks && navLinks.length > 0 ? navLinks : FALLBACK_NAV;

  const items = [
    { href: safeHref(nav[0]?.href) || "/", label: nav[0]?.label ?? "Home", icon: "home" as const },
    { href: safeHref(nav[1]?.href) || "#shop", label: nav[1]?.label ?? "Shop", icon: "search" as const },
    { href: "#", label: "Cart", icon: "cart" as const },
    { href: safeHref(nav[3]?.href) || "#contact", label: nav[3]?.label ?? "Account", icon: "user" as const },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="hidden fixed left-0 right-0 z-40 items-center justify-around border-t border-white/10 px-4 py-3 text-white"
      style={{ bottom: "100px", backgroundColor: "var(--brand-navy)" }}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-1 text-xs font-medium text-white/90 hover:text-white"
        >
          {item.icon === "search" && <IconSearch className="h-5 w-5" aria-hidden />}
          {item.icon === "cart" && <IconCart className="h-5 w-5" aria-hidden />}
          {item.icon === "user" && <IconUser className="h-5 w-5" aria-hidden />}
          {item.icon === "home" && (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
