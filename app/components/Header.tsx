import Link from "next/link";
import { IconCart, IconSearch, IconUser } from "./Icons";

const nav = [
  { href: "#shop", label: "Shop" },
  { href: "#about", label: "Our Story" },
  { href: "#learn", label: "Recipes" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-lg bg-slate-100 px-4 text-xs font-semibold tracking-wide text-slate-700"
          >
            LOGO
          </Link>

          <nav className="hidden md:flex items-center gap-10 text-sm text-slate-600">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-slate-900 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100/70 hover:bg-slate-100 transition-colors"
              aria-label="Search"
            >
              <IconSearch className="h-5 w-5 text-slate-700" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100/70 hover:bg-slate-100 transition-colors"
              aria-label="Account"
            >
              <IconUser className="h-5 w-5 text-slate-700" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100/70 hover:bg-slate-100 transition-colors"
              aria-label="Cart"
            >
              <IconCart className="h-5 w-5 text-slate-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

