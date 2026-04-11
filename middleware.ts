import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CUSTOMER_ACCOUNT_PORTAL_URL } from "@/lib/customerAccountPortal";

/**
 * Exposes pathname (and shop search flag) on the request so the root layout can
 * SSR footer-wave / header-wave settings and match the first client paint.
 */
export function middleware(request: NextRequest) {
  /**
   * Customer Accounts login can redirect to `/customer_authentication/sso_hint?...` on the
   * storefront origin. If Shopify sends that path to the headless domain, Next has no route
   * (404). Forward to the hosted Customer Accounts host (same path + query).
   */
  if (request.nextUrl.pathname.startsWith("/customer_authentication")) {
    const dest = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      CUSTOMER_ACCOUNT_PORTAL_URL,
    );
    return NextResponse.redirect(dest, 302);
  }

  if (
    request.nextUrl.pathname === "/pages/marketform" ||
    request.nextUrl.pathname === "/pages/marketsignup"
  ) {
    return NextResponse.redirect(new URL("/", request.url), 301);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  const sp = request.nextUrl.searchParams;
  const shopSearch =
    (request.nextUrl.pathname === "/shop" ||
      request.nextUrl.pathname.startsWith("/shop/")) &&
    (sp.has("q") || sp.has("search") || sp.has("s"));
  requestHeaders.set("x-shop-search", shopSearch ? "1" : "0");
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Skip static assets and Next internals; run for all HTML routes.
     */
    "/((?!_next/static|_next/image|favicon.ico|studio|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
