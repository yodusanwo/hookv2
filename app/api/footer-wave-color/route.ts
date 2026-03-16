import { NextResponse } from "next/server";
import { client, PAGE_LAYOUT_SETTINGS_QUERY } from "@/lib/sanity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageLayoutSettings = { color?: string | null; hideHeaderWave?: boolean };

/**
 * GET /api/footer-wave-color?path=/calendar
 * Returns { color: string | null, hideHeaderWave: boolean } for the page.
 * color = area above the footer (wave strip); hideHeaderWave = hide the top wave below the header.
 */
const SHOP_PAGE_STRIP_BG = "#F2F2F5"; // grey when no search
const SHOP_PAGE_SEARCH_STRIP_BG = "#D4F2FF"; // light blue when search is active
const PRODUCT_PAGE_STRIP_BG = "#D4F2FF"; // light blue to match Wild Flavor section above footer wave

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
    const color =
      slug === "shop"
        ? (search ? SHOP_PAGE_SEARCH_STRIP_BG : SHOP_PAGE_STRIP_BG)
        : slug.startsWith("products/")
          ? PRODUCT_PAGE_STRIP_BG
          : (data?.color ?? null);
    const hideHeaderWave = data?.hideHeaderWave === true;
    return NextResponse.json({ color, hideHeaderWave });
  } catch (e) {
    console.warn("footer-wave-color fetch failed:", e);
    return NextResponse.json({ color: null, hideHeaderWave: false });
  }
}
