import { NextResponse } from "next/server";
import { client, PAGE_LAYOUT_SETTINGS_QUERY } from "@/lib/sanity";

// Cache per path for 60s so client navigations don't trigger a Sanity fetch every time (reduces CPU spike).
export const revalidate = 60;

type PageLayoutSettings = { color?: string | null; hideHeaderWave?: boolean };

/**
 * GET /api/footer-wave-color?path=/calendar
 * Returns { color: string | null, hideHeaderWave: boolean } for the page.
 * color = area above the footer (wave strip); hideHeaderWave = hide the top wave below the header.
 */
const SHOP_PAGE_STRIP_BG = "#F2F2F5"; // grey when no search
const SHOP_PAGE_SEARCH_STRIP_BG = "#D4F2FF"; // light blue when search is active
const PRODUCT_PAGE_STRIP_BG = "#D4F2FF"; // light blue to match Wild Flavor section above footer wave
const CART_PAGE_STRIP_BG = "#FFFFFF"; // white above footer wave on /cart

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "";
  const search = searchParams.get("search") === "1" || searchParams.get("search") === "true";
  const slug = path.replace(/^\//, "").trim().split("?")[0] || "home";

  if (!client) {
    return NextResponse.json({ color: null, hideHeaderWave: false });
  }

  try {
    const data = await client.fetch<PageLayoutSettings | null>(
      PAGE_LAYOUT_SETTINGS_QUERY,
      {
        slug,
      },
    );
    // /shop: strip is grey when no search; light blue when search params (q, search, or s) are present
    // /products/[handle]: strip is light blue to match Wild Flavor section (no white gap above wave)
    // /cart: strip is white above the footer wave
    const isShopRoute = slug === "shop" || slug.startsWith("shop/");
    const color =
      slug === "cart"
        ? CART_PAGE_STRIP_BG
        : isShopRoute
          ? (search ? SHOP_PAGE_SEARCH_STRIP_BG : SHOP_PAGE_STRIP_BG)
          : slug.startsWith("products/")
            ? PRODUCT_PAGE_STRIP_BG
            : (data?.color ?? null);
    /** Shop routes: keep wave margin stable so Sanity toggles do not cause CLS after client fetch. */
    const hideHeaderWave = isShopRoute ? false : data?.hideHeaderWave === true;
    return NextResponse.json({ color, hideHeaderWave });
  } catch (e) {
    console.warn("footer-wave-color fetch failed:", e);
    return NextResponse.json({ color: null, hideHeaderWave: false });
  }
}
