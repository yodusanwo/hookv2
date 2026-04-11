import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CUSTOMER_ACCOUNT_PORTAL_URL } from "@/lib/customerAccountPortal";

/**
 * Params to keep on legacy `/blogs/recipes` → `/recipes` redirects.
 * - `utm_*`: GA4, email (e.g. Klaviyo: `utm_medium=email`, `utm_source=klaviyo`, `utm_campaign=…`).
 * - Klaviyo click tracking: `_kx` (e.g. `/collections/shop-all?_kx=…` — unchanged unless a redirect strips it).
 * - Ad click IDs: `gclid`, `fbclid`, `msclkid`.
 * - Affiliate-style: `ref`, `referrer`.
 */
function shouldPreserveMarketingParam(key: string): boolean {
  const k = key.toLowerCase();
  return (
    k.startsWith("utm_") ||
    k === "_kx" ||
    k === "gclid" ||
    k === "fbclid" ||
    k === "msclkid" ||
    k === "ref" ||
    k === "referrer"
  );
}

function redirect308PreserveMarketing(
  request: NextRequest,
  destinationPath: string,
): NextResponse {
  const url = new URL(destinationPath, request.url);
  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    if (shouldPreserveMarketingParam(key)) {
      url.searchParams.append(key, value);
    }
  }
  return NextResponse.redirect(url, 308);
}

/**
 * Exposes pathname (and shop search flag) on the request so the root layout can
 * SSR footer-wave / header-wave settings and match the first client paint.
 */
export function middleware(request: NextRequest) {
  /**
   * Customer Accounts + Shop sign-in paths live on the portal host, not the headless app.
   * If Shopify sends them to the storefront domain, Next has no route (404).
   * Forward to account.hookpointfish.com (same path + query).
   */
  const accountPortalPrefixes = [
    "/customer_authentication",
    "/customer_identity",
    "/services/login_with_shop",
  ];
  if (
    accountPortalPrefixes.some((prefix) =>
      request.nextUrl.pathname.startsWith(prefix),
    )
  ) {
    const dest = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      CUSTOMER_ACCOUNT_PORTAL_URL,
    );
    return NextResponse.redirect(dest, 302);
  }

  /** Legacy Shopify blog URLs → `/recipes` (308). Preserves marketing params above; drops e.g. `?page=`. */
  const pathNoTrailingSlash =
    request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  if (pathNoTrailingSlash === "/blogs/recipes") {
    return redirect308PreserveMarketing(request, "/recipes");
  }
  /** Old blog slug → current Sanity recipe slug (differs from 1:1 path). */
  if (
    pathNoTrailingSlash === "/blogs/recipes/alaska-seafood-breakfast-hash"
  ) {
    return redirect308PreserveMarketing(request, "/recipes/breakfast-hash");
  }
  if (
    pathNoTrailingSlash === "/blogs/recipes/bacon-wrapped-jalapeno-poppers"
  ) {
    return redirect308PreserveMarketing(
      request,
      "/recipes/bacon-wrapped-smoked-salmon-poppers",
    );
  }
  if (pathNoTrailingSlash === "/blogs/recipes/chopped-salad") {
    return redirect308PreserveMarketing(
      request,
      "/recipes/the-original-chopped-salad",
    );
  }
  if (
    pathNoTrailingSlash === "/blogs/recipes/coconut-poached-halibut"
  ) {
    return redirect308PreserveMarketing(
      request,
      "/recipes/coconut-poached-halibut-and-mango-avocado-salsa",
    );
  }
  if (pathNoTrailingSlash === "/blogs/recipes/nashville-hot-fish") {
    return redirect308PreserveMarketing(
      request,
      "/recipes/nashville-hot-fish-sandwich",
    );
  }
  if (pathNoTrailingSlash === "/blogs/recipes/simply-grilled") {
    return redirect308PreserveMarketing(
      request,
      "/recipes/simply-baked-salmon",
    );
  }
  /** Recipe not published yet → index. When `/recipes/corned-salmon` exists, point this to that path instead. */
  if (pathNoTrailingSlash === "/blogs/recipes/corned-salmon") {
    return redirect308PreserveMarketing(request, "/recipes");
  }
  /** No matching live recipe slug — legacy blog URL → index. */
  if (pathNoTrailingSlash === "/blogs/recipes/salmon-osso-buco") {
    return redirect308PreserveMarketing(request, "/recipes");
  }
  /** “The Basics” lived under the old blog — map to `/basics`. */
  if (pathNoTrailingSlash === "/blogs/recipes/skinning") {
    return redirect308PreserveMarketing(request, "/basics/skinning");
  }
  if (pathNoTrailingSlash === "/blogs/recipes/thawing") {
    return redirect308PreserveMarketing(request, "/basics/thawing");
  }
  if (pathNoTrailingSlash.startsWith("/blogs/recipes/")) {
    const slug = pathNoTrailingSlash.slice("/blogs/recipes/".length);
    if (slug && !slug.includes("/")) {
      return redirect308PreserveMarketing(request, `/recipes/${slug}`);
    }
  }

  /** Legacy short URL → The Basics (cooking temperature). */
  if (pathNoTrailingSlash === "/recipes/temperature") {
    return redirect308PreserveMarketing(request, "/basics/cooking-temperature");
  }

  if (pathNoTrailingSlash === "/collections/pet-treats") {
    return redirect308PreserveMarketing(request, "/shop/pet-treats");
  }

  /** Shopify legacy collection URLs → headless shop. */
  if (
    pathNoTrailingSlash === "/collections" ||
    pathNoTrailingSlash === "/collections/all" ||
    pathNoTrailingSlash === "/collections/hook-point-seafood"
  ) {
    return redirect308PreserveMarketing(request, "/shop");
  }

  /** Legacy collection / PDP URLs → home (no headless equivalent). */
  if (
    pathNoTrailingSlash === "/collections/sale-items" ||
    pathNoTrailingSlash === "/collections/hook-point-merch" ||
    pathNoTrailingSlash ===
      "/collections/hook-point-merch/products/hook-point-fish-hat" ||
    pathNoTrailingSlash ===
      "/collections/hook-point-merch/products/never-tamed-t-shirt"
  ) {
    return redirect308PreserveMarketing(request, "/");
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
