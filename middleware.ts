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

/** PDP redirect with a fixed `variant` id plus marketing params. Use when `?variant=` must not rely on `new URL(path?query, base)` parsing. */
function redirect308ProductVariant(
  request: NextRequest,
  productPathname: string,
  variantId: string,
): NextResponse {
  const url = new URL(productPathname, request.url);
  url.searchParams.set("variant", variantId);
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
  if (pathNoTrailingSlash === "/collections/seafood-boxes") {
    return redirect308PreserveMarketing(request, "/shop/seafood-boxes");
  }
  if (pathNoTrailingSlash === "/collections/smoked-specialty") {
    return redirect308PreserveMarketing(request, "/shop/smoked-specialty");
  }
  if (pathNoTrailingSlash === "/collections/wild-alaska-salmon") {
    return redirect308PreserveMarketing(request, "/shop/salmon");
  }

  /** Shopify legacy collection URLs → headless shop. */
  if (
    pathNoTrailingSlash === "/collections" ||
    pathNoTrailingSlash === "/collections/all" ||
    pathNoTrailingSlash === "/collections/shop-all" ||
    pathNoTrailingSlash === "/collections/hook-point-seafood" ||
    pathNoTrailingSlash === "/collections/spices-and-butters"
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
      "/collections/hook-point-merch/products/never-tamed-t-shirt" ||
    pathNoTrailingSlash === "/products/good-fish-t-shirt-1" ||
    pathNoTrailingSlash === "/products/hook-point-classic-logo-hoodie" ||
    pathNoTrailingSlash === "/products/hook-point-compass-t-shirt" ||
    pathNoTrailingSlash === "/products/hook-point-fish-hat" ||
    pathNoTrailingSlash === "/products/hook-point-hat" ||
    pathNoTrailingSlash === "/products/hook-point-logo-t-shirt-1" ||
    pathNoTrailingSlash === "/products/never-tamed-t-shirt" ||
    pathNoTrailingSlash === "/products/relax-baseball-shirt-1" ||
    pathNoTrailingSlash === "/products/veidistafur-hoodie-1"
  ) {
    return redirect308PreserveMarketing(request, "/");
  }

  /** Legacy Shopify product (PDP) URLs → headless shop. */
  if (pathNoTrailingSlash === "/products/2023-salmon-shares-20-lb") {
    return redirect308PreserveMarketing(request, "/shop/salmon");
  }
  /** Duplicate / draft handle → canonical PDP. */
  if (pathNoTrailingSlash === "/products/wild-alaska-sockeye-box-copy") {
    return redirect308PreserveMarketing(
      request,
      "/products/wild-alaska-sockeye",
    );
  }
  if (pathNoTrailingSlash === "/products/wild-cuts-pet-treats-5-pack-copy") {
    return redirect308ProductVariant(
      request,
      "/products/wild-cuts-pet-treat-box",
      "52203933958437",
    );
  }

  /** Legacy Shopify `/pages/*` → headless routes. */
  if (
    pathNoTrailingSlash === "/pages/about" ||
    pathNoTrailingSlash === "/pages/about-us" ||
    pathNoTrailingSlash === "/pages/fall-2023-about-us"
  ) {
    return redirect308PreserveMarketing(request, "/about");
  }
  if (pathNoTrailingSlash === "/pages/calendar") {
    return redirect308PreserveMarketing(request, "/calendar");
  }
  if (pathNoTrailingSlash === "/pages/contact-1") {
    return redirect308PreserveMarketing(request, "/contact");
  }
  if (pathNoTrailingSlash === "/pages/faqs-1") {
    return redirect308PreserveMarketing(request, "/faq");
  }
  if (pathNoTrailingSlash === "/pages/recipes") {
    return redirect308PreserveMarketing(request, "/recipes");
  }
  if (pathNoTrailingSlash === "/pages/sustainability") {
    return redirect308PreserveMarketing(request, "/wild-vs-farmed");
  }
  if (pathNoTrailingSlash === "/pages/wild-vs-farmed") {
    return redirect308PreserveMarketing(request, "/wild-vs-farmed");
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
