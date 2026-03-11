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

const footerNavLinkStyle = {
  color: "#FFF",
  fontFamily: "Inter, var(--font-inter), sans-serif",
  fontSize: "16px",
  fontStyle: "normal" as const,
  fontWeight: 400,
  lineHeight: "normal",
};

const CONTACT_PAGE_FOOTER_BG = "#D4F2FF";

export function Footer({
  logoUrl,
  pathname,
  footerWaveBackgroundColor,
}: {
  logoUrl?: string | null;
  /** When pathname is /contact and no footerWaveBackgroundColor, use light blue. */
  pathname?: string | null;
  /** Background color for the area above the footer (wave strip). Set per page in Sanity. */
  footerWaveBackgroundColor?: string | null;
}) {
  const logoSrc = logoUrl ?? FALLBACK_LOGO;
  const waveBg =
    footerWaveBackgroundColor ??
    (pathname === "/contact" ? CONTACT_PAGE_FOOTER_BG : undefined);
  return (
    <footer id="contact" className="relative overflow-visible" style={{ backgroundColor: "var(--footer-bg)" }}>
      {/* Wave above footer content — pt for drop-shadow clearance on mobile; color from Sanity or /contact fallback */}
      <div className="w-full pt-6 sm:pt-8 section-bg-light" aria-hidden style={waveBg ? { backgroundColor: waveBg } : undefined}>
        <img
          src="/wavefooter.png"
          alt=""
          className="w-full h-auto block align-bottom navy-wave-outline-top"
        />
      </div>
      {/* Main footer content — 4 columns */}
      <div className="mx-auto max-w-6xl px-4 py-12 pb-16 md:pb-12" style={{ backgroundColor: "var(--footer-bg)" }}>
        <div className="grid grid-cols-1 gap-12 md:[grid-template-columns:1fr_1.15fr_0.5fr_3fr]">
          {/* Column 1: Logo + copyright */}
          <div className="">
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
          <div className="">
            <form
              className="rounded-xl p-6 flex flex-col gap-3"
              style={{ backgroundColor: "#D4F2FF" }}
            >
              <h3
                className="mb-0 whitespace-nowrap"
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
                className="h-11 w-full rounded-md text-sm font-semibold text-white transition-colors hover:opacity-90 flex items-center justify-center"
                style={{ backgroundColor: "#069400" }}
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Column 3: Navigation links */}
          <div className="">
            <ul className="flex flex-col gap-2">
              <li>
                <a href="#shop" className="hover:text-white transition-colors" style={footerNavLinkStyle}>
                  Shop
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors" style={footerNavLinkStyle}>
                  Our Story
                </a>
              </li>
              <li>
                <a href="#recipes" className="hover:text-white transition-colors" style={footerNavLinkStyle}>
                  Recipes
                </a>
              </li>
              <li>
                <a href="#calendar" className="hover:text-white transition-colors" style={footerNavLinkStyle}>
                  Calendar
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors" style={footerNavLinkStyle}>
                  FAQ
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-colors" style={footerNavLinkStyle}>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Proud member + org logos + social */}
          <div className="">
            <h3
              className="mb-4 whitespace-nowrap"
              style={{
                color: "#FFF",
                fontFamily: "Inter, var(--font-inter), sans-serif",
                fontSize: "16px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Proud Member of the following organizations
            </h3>
            <div className="flex flex-wrap gap-4 items-center mb-6">
              {/* Org logo placeholders — replace src with actual logo URLs */}
              <img
                src="/SalmonState.png"
                alt="SalmonState"
                className="rounded object-contain"
                style={{ width: "81.722px", height: "81.722px", aspectRatio: "1/1" }}
              />
              <img
                src="/local_catch.png"
                alt="Local Catch Network"
                className="rounded object-contain"
                style={{ width: "65.434px", height: "65.434px", aspectRatio: "1/1" }}
              />
              <img
                src="/NWSA_transparent%201%20(1).png"
                alt="Northwest Salmon Association"
                className="rounded object-contain"
                style={{ width: "94px", height: "94px", aspectRatio: "1/1" }}
              />
              <img
                src="/Hatch%201.png"
                alt="The Hatchery"
                className="rounded object-contain"
                style={{ width: "94px", height: "94px", aspectRatio: "1/1" }}
              />
            </div>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center transition-colors hover:opacity-90"
                style={{ width: 32, height: 32, borderRadius: 10, background: "#EEF1F6" }}
                aria-label="Facebook"
              >
                <img src="/Facebook.svg" alt="" className="h-5 w-5 object-contain" aria-hidden />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center transition-colors hover:opacity-90"
                style={{ width: 32, height: 32, borderRadius: 10, background: "#EEF1F6" }}
                aria-label="Instagram"
              >
                <img src="/Instagram.svg" alt="" className="h-5 w-5 object-contain" aria-hidden />
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
