"use client";

import { useEffect } from "react";

/**
 * Scrolls to top of page on mount. Use on product page so that when navigating
 * from another page (e.g. product card or "see more" on mobile), the page opens at the top.
 */
export function ScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}
