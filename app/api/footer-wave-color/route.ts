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
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "";
  const slug = path.replace(/^\//, "").trim() || "home";

  if (!client) {
    return NextResponse.json({ color: null, hideHeaderWave: false });
  }

  try {
    const data = await client.fetch<PageLayoutSettings | null>(PAGE_LAYOUT_SETTINGS_QUERY, {
      slug,
    });
    const color = data?.color ?? null;
    const hideHeaderWave = data?.hideHeaderWave === true;
    return NextResponse.json({ color, hideHeaderWave });
  } catch (e) {
    console.warn("footer-wave-color fetch failed:", e);
    return NextResponse.json({ color: null, hideHeaderWave: false });
  }
}
