"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Pushes a `page_view` to `dataLayer` on client-side navigations only (skips the first paint
 * so GTM’s initial load can own the first page_view). Map in GTM to GA4 if you use SPA-style routing.
 */
export function GtmRouteChange() {
  const pathname = usePathname();
  const skipFirst = React.useRef(true);

  React.useEffect(() => {
    if (!pathname || typeof window === "undefined") return;
    const id = process.env.NEXT_PUBLIC_GTM_ID?.trim();
    if (!id) return;

    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }

    const w = window as Window & { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: "page_view",
      page_path: pathname,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [pathname]);

  return null;
}
