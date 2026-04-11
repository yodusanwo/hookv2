"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { FooterWaveOverrideProvider } from "@/app/context/FooterWaveOverride";
import { Header } from "./Header";
import { HeaderWave } from "./HeaderWave";
import { Footer } from "./Footer";
import { CartPopup } from "./CartPopup";

type SiteLayoutProps = {
  children: React.ReactNode;
  headerLogoUrl: string | null;
  navLinks: Array<{ label?: string; href?: string }>;
  headerBackgroundColor: string | null;
  accountUrl?: string | null;
  useHeadlessAccount?: boolean;
  /** Set in root layout from HttpOnly session cookie (headless Customer Account API). */
  headlessAccountLoggedIn?: boolean;
  /** From root layout SSR — matches CMS so first paint doesn’t show the header wave before hideHeaderWave applies. */
  initialFooterWaveColor?: string | null;
  initialHideHeaderWave?: boolean;
};

/** Passed from SiteLayout when footer wave override state is lifted (shop strip color). */
type SiteLayoutShellProps = SiteLayoutProps & {
  footerWaveOverride?: string | null;
};

/**
 * Inner layout that uses useSearchParams. Must be wrapped in Suspense so static
 * pages (e.g. 404) can prerender without access to search params.
 *
 * Follow-up (lower priority): narrow Suspense to only the subtree that reads search params so
 * the fallback matches the resolved layout more closely and reduces subtree swap on hydration.
 */
function SiteLayoutInner({
  children,
  headerLogoUrl,
  navLinks,
  headerBackgroundColor,
  accountUrl,
  useHeadlessAccount,
  headlessAccountLoggedIn = false,
  footerWaveOverride = null,
  initialFooterWaveColor = null,
  initialHideHeaderWave = false,
}: SiteLayoutShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  const [footerWaveColor, setFooterWaveColor] = useState<string | null>(
    () => initialFooterWaveColor ?? null,
  );
  const [hideHeaderWave, setHideHeaderWave] = useState(
    () => initialHideHeaderWave,
  );

  useEffect(() => {
    if (!pathname) {
      setFooterWaveColor(initialFooterWaveColor ?? null);
      setHideHeaderWave(initialHideHeaderWave);
      return;
    }
    let cancelled = false;
    const path = pathname === "/" ? "/" : pathname;
    const queryParams = new URLSearchParams(search);
    const isShopSearch =
      (pathname === "/shop" || pathname?.startsWith("/shop/")) &&
      (queryParams.has("q") || queryParams.has("search") || queryParams.has("s"));
    const url = `/api/footer-wave-color?path=${encodeURIComponent(path)}${isShopSearch ? "&search=1" : ""}`;
    fetch(url)
      .then((res) => res.json())
      .then((data: { color?: string | null; hideHeaderWave?: boolean }) => {
        if (cancelled) return;
        if (data && typeof data.color === "string" && data.color.trim()) {
          setFooterWaveColor(data.color.trim());
        } else {
          setFooterWaveColor(null);
        }
        setHideHeaderWave(data?.hideHeaderWave === true);
      })
      .catch(() => {
        if (!cancelled) {
          setFooterWaveColor(initialFooterWaveColor ?? null);
          setHideHeaderWave(initialHideHeaderWave);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    pathname,
    search,
    initialFooterWaveColor,
    initialHideHeaderWave,
  ]);

  const effectiveWaveColor = footerWaveOverride ?? footerWaveColor;

  return (
    <>
      <Header
        logoUrl={headerLogoUrl}
        navLinks={navLinks}
        backgroundColor={headerBackgroundColor}
        accountUrl={accountUrl}
        useHeadlessAccount={useHeadlessAccount}
        headlessAccountLoggedIn={headlessAccountLoggedIn}
      />
      <div className="h-[110px] sm:h-[140px] shrink-0" aria-hidden />
      {!hideHeaderWave && <HeaderWave />}
      <div
        className={`relative z-0 overflow-x-clip ${hideHeaderWave ? "-mt-0" : "-mt-[96px] sm:-mt-[150px] lg:-mt-[206px]"}`}
      >
        {children}
      </div>
      <Footer
        logoUrl={headerLogoUrl}
        pathname={pathname ?? undefined}
        footerWaveBackgroundColor={effectiveWaveColor}
      />
      <CartPopup />
    </>
  );
}

/**
 * Fallback when Suspense is loading (e.g. during 404 prerender). Same layout with default footer wave color.
 */
function SiteLayoutFallback({
  children,
  headerLogoUrl,
  navLinks,
  headerBackgroundColor,
  accountUrl,
  useHeadlessAccount,
  headlessAccountLoggedIn = false,
  footerWaveOverride = null,
  initialFooterWaveColor = null,
  initialHideHeaderWave = false,
}: SiteLayoutShellProps) {
  const pathname = usePathname();
  const hideHeaderWave = initialHideHeaderWave;
  const effectiveWaveColor = footerWaveOverride ?? initialFooterWaveColor;
  return (
    <>
      <Header
        logoUrl={headerLogoUrl}
        navLinks={navLinks}
        backgroundColor={headerBackgroundColor}
        accountUrl={accountUrl}
        useHeadlessAccount={useHeadlessAccount}
        headlessAccountLoggedIn={headlessAccountLoggedIn}
      />
      <div className="h-[110px] sm:h-[140px] shrink-0" aria-hidden />
      {!hideHeaderWave && <HeaderWave />}
      <div
        className={`relative z-0 overflow-x-clip ${hideHeaderWave ? "-mt-0" : "-mt-[96px] sm:-mt-[150px] lg:-mt-[206px]"}`}
      >
        {children}
      </div>
      <Footer
        logoUrl={headerLogoUrl}
        pathname={pathname ?? undefined}
        footerWaveBackgroundColor={effectiveWaveColor}
      />
      <CartPopup />
    </>
  );
}

/**
 * Wraps the main site in Header, wave, and Footer.
 * For /studio routes, renders only children so Sanity Studio has the full page.
 */
export function SiteLayout(props: SiteLayoutProps) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");
  const [footerWaveOverride, setFooterWaveOverride] = useState<string | null>(
    null,
  );
  const setOverride = useCallback(
    (color: string | null) => setFooterWaveOverride(color),
    [],
  );

  if (isStudio) {
    return <>{props.children}</>;
  }

  return (
    <FooterWaveOverrideProvider value={{ setOverride }}>
      <Suspense
        fallback={
          <SiteLayoutFallback {...props} footerWaveOverride={footerWaveOverride} />
        }
      >
        <SiteLayoutInner {...props} footerWaveOverride={footerWaveOverride} />
      </Suspense>
    </FooterWaveOverrideProvider>
  );
}
