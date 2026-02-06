import Link from "next/link";
import { IconCart, IconSearch, IconUser } from "./Icons";

const nav = [
  { href: "#shop", label: "Shop" },
  { href: "#about", label: "Our Story" },
  { href: "#recipes", label: "Recipes" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact Us" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/95 backdrop-blur">
      {/* Top bar per Figma */}
      <div className="border-b border-black/5 bg-slate-900 text-white">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-6 text-xs">
          <a href="tel:555-555-5555" className="hover:text-slate-200">
            Need help? Call Us: 555-555-5555
          </a>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Search" className="p-1 hover:text-slate-200">
              <IconSearch className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Account" className="p-1 hover:text-slate-200">
              <IconUser className="h-4 w-4" />
            </button>
            <Link href="#" aria-label="Cart" className="p-1 hover:text-slate-200">
              <IconCart className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-slate-900"
          >
            HOOK POINT
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
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
            <button type="button" aria-label="Search" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <IconSearch className="h-5 w-5 text-slate-700" />
            </button>
            <button type="button" aria-label="Account" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <IconUser className="h-5 w-5 text-slate-700" />
            </button>
            <Link href="#" aria-label="Cart" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <IconCart className="h-5 w-5 text-slate-700" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

