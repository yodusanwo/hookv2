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
};

/**
 * Inner layout that uses useSearchParams. Must be wrapped in Suspense so static
 * pages (e.g. 404) can prerender without access to search params.
 */
function SiteLayoutInner({
  children,
  headerLogoUrl,
  navLinks,
  headerBackgroundColor,
}: SiteLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [footerWaveColor, setFooterWaveColor] = useState<string | null>(null);
  const [footerWaveOverride, setFooterWaveOverride] = useState<string | null>(null);
  const [hideHeaderWave, setHideHeaderWave] = useState(false);
  const setOverride = useCallback((color: string | null) => setFooterWaveOverride(color), []);

  useEffect(() => {
    if (!pathname) {
      setFooterWaveColor(null);
      setHideHeaderWave(false);
      return;
    }
    let cancelled = false;
    const path = pathname === "/" ? "/" : pathname;
    const isShopSearch =
      pathname === "/shop" &&
      (searchParams.has("q") || searchParams.has("search") || searchParams.has("s"));
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
          setFooterWaveColor(null);
          setHideHeaderWave(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  const effectiveWaveColor = footerWaveOverride ?? footerWaveColor;

  return (
    <FooterWaveOverrideProvider value={{ setOverride }}>
      <Header
        logoUrl={headerLogoUrl}
        navLinks={navLinks}
        backgroundColor={headerBackgroundColor}
      />
      <div className="h-[80px] sm:h-[107px] shrink-0" aria-hidden />
      {!hideHeaderWave && <HeaderWave />}
      <div
        className={`relative z-0 ${hideHeaderWave ? "-mt-0" : "-mt-[120px] sm:-mt-[150px] lg:-mt-[206px]"}`}
      >
        {children}
      </div>
      <Footer
        logoUrl={headerLogoUrl}
        pathname={pathname ?? undefined}
        footerWaveBackgroundColor={effectiveWaveColor}
      />
      <CartPopup />
    </FooterWaveOverrideProvider>
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
}: SiteLayoutProps) {
  const pathname = usePathname();
  return (
    <>
      <Header
        logoUrl={headerLogoUrl}
        navLinks={navLinks}
        backgroundColor={headerBackgroundColor}
      />
      <div className="h-[80px] sm:h-[107px] shrink-0" aria-hidden />
      <HeaderWave />
      <div className="relative z-0 -mt-[120px] sm:-mt-[150px] lg:-mt-[206px]">{children}</div>
      <Footer
        logoUrl={headerLogoUrl}
        pathname={pathname ?? undefined}
        footerWaveBackgroundColor={null}
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

  if (isStudio) {
    return <>{props.children}</>;
  }

  return (
    <Suspense fallback={<SiteLayoutFallback {...props} />}>
      <SiteLayoutInner {...props} />
    </Suspense>
  );
}
