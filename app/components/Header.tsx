import Link from "next/link";
import { IconCart, IconSearch, IconUser } from "./Icons";
import { safeHref } from "@/lib/urlValidation";

const FALLBACK_NAV = [
  { href: "#shop", label: "Shop" },
  { href: "#about", label: "Our Story" },
  { href: "#recipes", label: "Recipes" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact Us" },
];

const FALLBACK_LOGO = "/Hook_Point_Shirt_White_Letters_042acd76-dff8-4246-874a-1df73d011a24%201.png";
const FALLBACK_BG = "#171730";

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
  const nav = navLinks && navLinks.length > 0 ? navLinks : FALLBACK_NAV;
  const bgColor = backgroundColor ?? FALLBACK_BG;

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: bgColor,
      }}
    >
      {/* Logo area: 1440px × 107px */}
      <div
        className="mx-auto flex h-[107px] w-full max-w-[1440px] items-center justify-between gap-4 px-6 text-white"
        style={{ width: "min(1440px, 100%)" }}
      >
        <Link
          href="/"
          className="block shrink-0 border-0 outline-none ring-0 w-[58px] h-[56px] sm:w-[72px] sm:h-[70px] md:w-[88.7px] md:h-[86.5px]"
          aria-label="Hook Point home"
          style={{
            aspectRatio: "40/39",
            background: `url(${logoSrc}) #171730 50% / cover no-repeat`,
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
          <button type="button" aria-label="Search" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <IconSearch className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Account" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <IconUser className="h-5 w-5" />
          </button>
          <Link href="#" aria-label="Cart" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <IconCart className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

