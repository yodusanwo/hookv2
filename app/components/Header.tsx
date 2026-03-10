"use client";

import { useState } from "react";
import Link from "next/link";
import { IconSearch, IconUser } from "./Icons";
import { CartCount } from "./CartCount";
import { safeHref } from "@/lib/urlValidation";

const FALLBACK_NAV = [
  { href: "#shop", label: "Shop" },
  { href: "#about", label: "Our Story" },
  { href: "#recipes", label: "Recipes" },
  { href: "#calendar", label: "Calendar" },
  { href: "/contact", label: "Contact Us" },
];

const FALLBACK_LOGO = "/Hook_Point_Shirt_White_Letters_042acd76-dff8-4246-874a-1df73d011a24%201.png";
const FALLBACK_BG = "var(--brand-navy)";

/** Replace FAQ with Calendar so desktop and mobile always show the same menu. */
function normalizeNav(items: Array<{ label?: string; href?: string }>) {
  return items.map((item) =>
    item.href === "#faq" || item.label?.toLowerCase() === "faq"
      ? { href: "#calendar", label: "Calendar" }
      : item
  );
}

export function Header({
  logoUrl,
  navLinks,
  backgroundColor,
}: {
  logoUrl?: string | null;
  navLinks?: Array<{ label?: string; href?: string }>;
  backgroundColor?: string | null;
}) {
  const logoSrc = logoUrl ?? FALLBACK_LOGO;
  const nav = normalizeNav(navLinks && navLinks.length > 0 ? navLinks : FALLBACK_NAV);
  const bgColor = backgroundColor ?? FALLBACK_BG;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 w-full"
      style={{
        backgroundColor: bgColor,
      }}
    >
      {/* Layout: 1440px max, spacing per ref (31 top/bottom, 90 sides at 1440) */}
      <div
        className="mx-auto flex min-h-[80px] w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-4 text-white sm:min-h-[107px] sm:px-6 sm:py-[31px] xl:px-[90px]"
        style={{ width: "min(1440px, 100%)" }}
      >
        <Link
          href="/"
          className="block shrink-0 border-0 outline-none ring-0 w-[64px] h-[62px] sm:w-[79px] sm:h-[77px] md:w-[97.6px] md:h-[95px]"
          aria-label="Hook Point home"
          style={{
            aspectRatio: "40/39",
            background: `url(${logoSrc}) var(--brand-navy) 50% / cover no-repeat`,
            border: "none",
            boxShadow: "none",
          }}
        />

        <nav className="hidden md:flex items-center gap-16 text-xl font-medium text-white [font-family:var(--font-inter)]">
          {nav.map((item) => {
            const href = safeHref(item.href) || "#";
            const label = item.label ?? "Link";
            return (
              <a
                key={`${href}-${label}`}
                href={href}
                className="hover:text-slate-200 transition-colors"
              >
                {label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/10 md:hidden"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            <span className={`h-0.5 w-6 bg-white transition-transform ${mobileMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-6 bg-white transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-6 bg-white transition-transform ${mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
          <button type="button" aria-label="Search" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <IconSearch className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Account" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <IconUser className="h-5 w-5" />
          </button>
          <CartCount />
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div
          className="border-t border-white/20 bg-[var(--brand-navy)] px-4 py-4 md:hidden"
          style={{ backgroundColor: bgColor }}
        >
          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const href = safeHref(item.href) || "#";
              const label = item.label ?? "Link";
              return (
                <Link
                  key={`${href}-${label}`}
                  href={href}
                  className="py-3 text-lg font-medium text-white hover:text-slate-200 [font-family:var(--font-inter)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

