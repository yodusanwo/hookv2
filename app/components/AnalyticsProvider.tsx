"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pushDataLayerEvent } from "@/app/lib/dataLayer";

/**
 * App Router navigations do not reload the page, so push a manual page_view on
 * first render and every subsequent route/search change.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";

  React.useEffect(() => {
    if (!pathname || typeof window === "undefined") return;
    const id = process.env.NEXT_PUBLIC_GTM_ID?.trim();
    if (!id) return;

    pushDataLayerEvent({
      event: "page_view",
      page_path: `${pathname}${search ? `?${search}` : ""}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, search]);

  return null;
}
