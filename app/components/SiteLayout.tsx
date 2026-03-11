"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import { HeaderWave } from "./HeaderWave";
import { Footer } from "./Footer";

type SiteLayoutProps = {
  children: React.ReactNode;
  headerLogoUrl: string | null;
  navLinks: Array<{ label?: string; href?: string }>;
  headerBackgroundColor: string | null;
};

/**
 * Wraps the main site in Header, wave, and Footer.
 * For /studio routes, renders only children so Sanity Studio has the full page.
 */
export function SiteLayout({
  children,
  headerLogoUrl,
  navLinks,
  headerBackgroundColor,
}: SiteLayoutProps) {
  const pathname = usePathname();
  const [footerWaveColor, setFooterWaveColor] = useState<string | null>(null);
  const [hideHeaderWave, setHideHeaderWave] = useState(false);
  const isStudio = pathname?.startsWith("/studio");

  useEffect(() => {
    if (!pathname || isStudio) {
      setFooterWaveColor(null);
      setHideHeaderWave(false);
      return;
    }
    let cancelled = false;
    const path = pathname === "/" ? "/" : pathname;
    fetch(`/api/footer-wave-color?path=${encodeURIComponent(path)}`)
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
  }, [pathname, isStudio]);

  if (isStudio) {
    return <>{children}</>;
  }

  return (
    <>
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
        footerWaveBackgroundColor={footerWaveColor}
      />
    </>
  );
}
