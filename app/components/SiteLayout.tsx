"use client";

import { usePathname } from "next/navigation";
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
  const isStudio = pathname?.startsWith("/studio");

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
      <HeaderWave />
      <div className="relative z-0 -mt-[120px] sm:-mt-[150px] lg:-mt-[206px]">
        {children}
      </div>
      <Footer />
    </>
  );
}
