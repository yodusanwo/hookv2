import Link from "next/link";

const FALLBACK_LOGO = "/Hook_Point_Shirt_White_Letters_042acd76-dff8-4246-874a-1df73d011a24%201.png";

const footerTextStyle = {
  color: "#FFF",
  fontFamily: "Inter, sans-serif",
  fontSize: "13px",
  fontStyle: "normal" as const,
  fontWeight: 400,
  lineHeight: "normal",
};

export function Footer({ logoUrl }: { logoUrl?: string | null }) {
  const logoSrc = logoUrl ?? FALLBACK_LOGO;
  return (
    <footer id="contact" className="relative overflow-visible" style={{ backgroundColor: "var(--footer-bg)" }}>
      {/* Wave above footer content — pt for drop-shadow clearance on mobile */}
      <div className="w-full pt-6 sm:pt-8 section-bg-light" aria-hidden>
        <img
          src="/wavefooter.png"
          alt=""
          className="w-full h-auto block align-bottom navy-wave-outline-top"
        />
      </div>
      {/* Main footer content — 4 columns */}
      <div className="mx-auto max-w-6xl px-4 py-12 pb-16 md:pb-12" style={{ backgroundColor: "var(--footer-bg)" }}>
        <div className="grid grid-cols-1 gap-12 md:[grid-template-columns:1fr_1fr_0.5fr_2fr]">
          {/* Column 1: Logo + copyright */}
          <div className="border-2 border-red-500">
            <Link
              href="/"
              className="block border-0 outline-none ring-0"
              aria-label="Hook Point home"
              style={{
                width: "180.495px",
                height: "175.983px",
                aspectRatio: "40/39",
                background: `url(${logoSrc}) var(--footer-bg) 50% / cover no-repeat`,
              }}
            />
            <p className="mt-4" style={footerTextStyle}>
              © 2026 All Rights Reserved
            </p>
          </div>

          {/* Column 2: Newsletter — News, deals & drops */}
          <div className="border-2 border-red-500">
            <form
              className="rounded-xl p-6 flex flex-col gap-3"
              style={{ backgroundColor: "#D4F2FF" }}
            >
              <h3
                className="mb-0"
                style={{ ...footerTextStyle, fontSize: "16px", fontWeight: 600, color: "#171717" }}
              >
                News, deals & drops
              </h3>
              <input
                type="text"
                placeholder="Full Name"
                name="fullName"
                className="h-11 w-full rounded-md bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                className="h-11 w-full rounded-md bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="submit"
                className="h-11 w-full rounded-md bg-emerald-500 px-4 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Column 3: Navigation links */}
          <div className="border-2 border-red-500">
            <ul className="flex flex-col gap-2">
              <li>
                <a href="#shop" className="hover:text-white transition-colors" style={footerTextStyle}>
                  Shop
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors" style={footerTextStyle}>
                  Our Story
                </a>
              </li>
              <li>
                <a href="#recipes" className="hover:text-white transition-colors" style={footerTextStyle}>
                  Recipes
                </a>
              </li>
              <li>
                <a href="#calendar" className="hover:text-white transition-colors" style={footerTextStyle}>
                  Calendar
                </a>
              </li>
              <li>
                <Link href="#faq" className="hover:text-white transition-colors" style={footerTextStyle}>
                  FAQ
                </Link>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors" style={footerTextStyle}>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Proud member + org logos + social */}
          <div className="border-2 border-red-500">
            <h3
              className="mb-4"
              style={{ ...footerTextStyle, fontSize: "16px", fontWeight: 600, maxWidth: 200 }}
            >
              Proud Member of the following organizations
            </h3>
            <div className="flex flex-wrap gap-4 items-center mb-6">
              {/* Org logo placeholders — replace src with actual logo URLs */}
              <div
                className="h-12 w-24 bg-white/20 rounded flex items-center justify-center text-white/60 text-xs"
                aria-hidden
              >
                SalmonState
              </div>
              <div
                className="h-12 w-24 bg-white/20 rounded flex items-center justify-center text-white/60 text-xs"
                aria-hidden
              >
                LOCAL CATCH
              </div>
              <div
                className="h-12 w-24 bg-white/20 rounded flex items-center justify-center text-white/60 text-xs"
                aria-hidden
              >
                NW Fisheries
              </div>
              <div
                className="h-12 w-24 bg-white/20 rounded flex items-center justify-center text-white/60 text-xs"
                aria-hidden
              >
                THE HATCHERY
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/60 text-white hover:bg-white/10 transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/60 text-white hover:bg-white/10 transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom border — thin light blue line */}
      <div
        className="w-full h-px"
        style={{ backgroundColor: "#5AA9E9" }}
        aria-hidden
      />
    </footer>
  );
}
