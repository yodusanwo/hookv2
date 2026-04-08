import Link from "next/link";
import { FooterHomeLogoLink } from "./FooterHomeLogoLink";

const FALLBACK_LOGO = "/Hook_Point_Shirt_White_Letters_042acd76-dff8-4246-874a-1df73d011a24%201.png";

const footerTextStyle = {
  color: "#FFF",
  fontFamily: "Inter, sans-serif",
  fontSize: "0.8125rem",
  fontStyle: "normal" as const,
  fontWeight: 400,
  lineHeight: "normal",
};

const footerNavLinkStyle = {
  color: "#FFF",
  fontFamily: "Inter, var(--font-inter), sans-serif",
  fontSize: "1rem",
  fontStyle: "normal" as const,
  fontWeight: 400,
  lineHeight: "normal",
};

const CONTACT_PAGE_FOOTER_BG = "#D4F2FF";
const SHOP_PAGE_WAVE_BG = "#F2F2F5"; // grey when no search; API overrides when search=1

export function Footer({
  logoUrl,
  pathname,
  footerWaveBackgroundColor,
}: {
  logoUrl?: string | null;
  /** When pathname is /contact and no footerWaveBackgroundColor, use light blue. */
  pathname?: string | null;
  /** Background color for the area above the footer (wave strip). Set per page in Sanity or API. */
  footerWaveBackgroundColor?: string | null;
}) {
  const logoSrc = logoUrl ?? FALLBACK_LOGO;
  /** Match `/shop` and `/shop/seafood` (etc.) so the strip isn’t unstyled until `/api/footer-wave-color` returns. */
  const isShopRoute = pathname === "/shop" || pathname?.startsWith("/shop/");
  const waveBg =
    footerWaveBackgroundColor ??
    (isShopRoute ? SHOP_PAGE_WAVE_BG : pathname === "/contact" ? CONTACT_PAGE_FOOTER_BG : undefined);
  const isRecipesPage = pathname === "/recipes" || pathname?.startsWith("/recipes/");
  const waveStripPadding = isRecipesPage ? "pt-0" : "pt-6 sm:pt-8";
  /** Default `py-12` top padding reads as a large navy gap under the wave on mobile (notably /wild-vs-farmed). Tighten top on small screens only. */
  const isWildVsFarmedPage = pathname === "/wild-vs-farmed";
  const mainFooterContentPadding = isWildVsFarmedPage
    ? "pt-3 pb-16 md:py-12 md:pb-12"
    : "py-12 pb-16 md:pb-12";
  return (
    <footer id="contact" className="relative overflow-visible" style={{ backgroundColor: "var(--footer-bg)" }}>
      {/* Wave above footer content — pt for drop-shadow clearance on mobile; minimal on /recipes to avoid gap */}
      <div
        className={`flex w-full flex-col leading-none section-bg-light ${waveStripPadding}`}
        aria-hidden
        style={waveBg ? { backgroundColor: waveBg } : undefined}
      >
        {/*
          Hairline on narrow/3x screens (Safari): white/light can show between PNG and navy block.
          flex-col + leading-none; bridge + overlap cover subpixel gaps (not z-index).
        */}
        <img
          src="/wavefooter.png"
          alt=""
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="block h-auto w-full max-w-full align-bottom navy-wave-outline-top [transform:translateZ(0)]"
        />
      </div>
      {/* Solid footer-color strip pulled up over the wave bottom — fixes 1–2px seam on small viewports */}
      <div
        className="pointer-events-none relative z-[2] h-[3px] w-full -mt-[3px] md:h-px md:-mt-px"
        style={{ backgroundColor: "var(--footer-bg)" }}
        aria-hidden
      />
      {/* Main footer content — mobile: single column centered, logo/copyright at bottom; desktop: 4 columns */}
      <div
        className={`relative z-[1] mx-auto max-w-6xl px-4 ${mainFooterContentPadding}`}
        style={{ backgroundColor: "var(--footer-bg)" }}
      >
        <div className="flex flex-col gap-0 md:grid md:gap-12 md:[grid-template-columns:1fr_1.15fr_0.5fr_3fr]">
          {/* Column 1: Logo + copyright — on mobile order-last so it appears at bottom */}
          <div className="order-last flex flex-col items-center text-center md:order-none md:items-start md:text-left">
            <FooterHomeLogoLink
              className="block border-0 outline-none ring-0 shrink-0"
              aria-label="Hook Point home"
              style={{
                width: "198.54px",
                height: "193.58px",
                aspectRatio: "40/39",
                background: `url(${logoSrc}) var(--footer-bg) 50% / cover no-repeat`,
              }}
            />
            <p className="mt-4" style={footerTextStyle}>
              © 2026 All Rights Reserved
            </p>
            <p className="mt-1" style={footerTextStyle}>
              Website design by{" "}
              <a
                href="https://www.zora.digital/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
                style={footerTextStyle}
              >
                Zora Digital
              </a>
            </p>
          </div>

          {/* Column 2: Newsletter — on mobile first, centered */}
          <div className="order-first flex flex-col items-center border-b border-white/20 pb-6 mb-6 md:border-0 md:pb-0 md:mb-0 md:order-none md:items-stretch">
            <form
              className="rounded-card p-6 flex flex-col gap-3 w-full max-w-md md:max-w-none"
              style={{ backgroundColor: "#D4F2FF" }}
            >
              <h3
                className="mb-0 whitespace-nowrap text-left"
                style={{ ...footerTextStyle, fontSize: "1rem", fontWeight: 600, color: "#171717" }}
              >
                News, deals & drops
              </h3>
              <input
                type="text"
                placeholder="Full Name"
                name="fullName"
                className="min-h-[44px] h-11 w-full rounded-md bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                className="min-h-[44px] h-11 w-full rounded-md bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="submit"
                className="min-h-[44px] h-11 w-full rounded-md text-sm font-semibold text-white transition-colors hover:opacity-90 flex items-center justify-center"
                style={{ backgroundColor: "#069400" }}
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Column 3: Navigation links — on mobile two columns (Shop/Our Story/Recipes | Calendar/FAQ/Contact), centered */}
          <div className="order-3 flex flex-col items-center border-b border-white/20 pb-6 mb-6 md:border-0 md:pb-0 md:mb-0 md:order-none md:-mt-5 md:items-stretch">
            <div className="flex flex-row gap-8 justify-center md:contents">
              <ul className="flex flex-col list-none m-0 p-0 [&>li]:m-0 [&>li]:p-0" style={{ gap: "1px" }}>
                <li>
                  <Link
                    href="/shop"
                    scroll
                    className="min-h-[44px] flex items-center justify-center md:justify-start hover:text-white transition-colors"
                    style={footerNavLinkStyle}
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    scroll
                    className="min-h-[44px] flex items-center justify-center md:justify-start hover:text-white transition-colors"
                    style={footerNavLinkStyle}
                  >
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link
                    href="/recipes"
                    scroll
                    className="min-h-[44px] flex items-center justify-center md:justify-start hover:text-white transition-colors"
                    style={footerNavLinkStyle}
                  >
                    Recipes
                  </Link>
                </li>
              </ul>
              <ul className="flex flex-col list-none m-0 p-0 [&>li]:m-0 [&>li]:p-0" style={{ gap: "1px" }}>
                <li>
                  <Link
                    href="/calendar"
                    scroll
                    className="min-h-[44px] flex items-center justify-center md:justify-start hover:text-white transition-colors"
                    style={footerNavLinkStyle}
                  >
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    scroll
                    className="min-h-[44px] flex items-center justify-center md:justify-start hover:text-white transition-colors"
                    style={footerNavLinkStyle}
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    scroll
                    className="min-h-[44px] flex items-center justify-center md:justify-start hover:text-white transition-colors"
                    style={footerNavLinkStyle}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: Proud member + org logos + social — on mobile order-2 (after newsletter), centered, org logos 2x2 */}
          <div className="order-2 flex flex-col items-center border-b border-white/20 pb-6 mb-6 md:border-0 md:pb-0 md:mb-0 md:order-none md:items-stretch">
            <h3
              className="mb-4 whitespace-nowrap text-center md:text-left w-full"
              style={{
                color: "#FFF",
                fontFamily: "Inter, var(--font-inter), sans-serif",
                fontSize: "1rem",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Proud Member of the following organizations
            </h3>
            <div className="grid grid-cols-2 gap-4 items-center justify-items-center mb-6 w-full max-w-xs md:max-w-none md:justify-items-start xl:grid-cols-4">
              <img
                src="/SalmonState.png"
                alt="SalmonState"
                className="rounded object-contain"
                style={{ width: "89.89px", height: "89.89px", aspectRatio: "1/1" }}
              />
              <img
                src="/local_catch.png"
                alt="Local Catch Network"
                className="rounded object-contain"
                style={{ width: "71.98px", height: "71.98px", aspectRatio: "1/1" }}
              />
              <img
                src="/NWSA_transparent%201%20(1).png"
                alt="Northwest Salmon Association"
                className="rounded object-contain"
                style={{ width: "103.4px", height: "103.4px", aspectRatio: "1/1" }}
              />
              <img
                src="/Hatch%201.png"
                alt="The Hatchery"
                className="rounded object-contain"
                style={{ width: "103.4px", height: "103.4px", aspectRatio: "1/1" }}
              />
            </div>
            <div className="flex gap-3 justify-center md:justify-start">
              <a
                href="https://www.facebook.com/HookPointAlaska/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center transition-colors hover:opacity-90 rounded-[10px]"
                style={{ background: "#EEF1F6" }}
                aria-label="Facebook"
              >
                <img src="/Facebook.svg" alt="" className="h-[22px] w-[22px] object-contain" aria-hidden />
              </a>
              <a
                href="https://www.instagram.com/hookpointalaska"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center transition-colors hover:opacity-90 rounded-[10px]"
                style={{ background: "#EEF1F6" }}
                aria-label="Instagram"
              >
                <img src="/Instagram.svg" alt="" className="h-[22px] w-[22px] object-contain" aria-hidden />
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
