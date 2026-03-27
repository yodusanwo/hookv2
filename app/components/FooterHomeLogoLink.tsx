"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Footer logo → home. Next `Link` to `/` does not always scroll to top when already on `/`;
 * we scroll explicitly in that case.
 */
export function FooterHomeLogoLink({
  className,
  style,
  "aria-label": ariaLabel,
}: {
  className?: string;
  style: CSSProperties;
  "aria-label": string;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <Link
      href="/"
      className={className}
      style={style}
      aria-label={ariaLabel}
      scroll={!isHome}
      onClick={(e) => {
        if (isHome) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
    />
  );
}
