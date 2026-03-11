import { NextResponse } from "next/server";
import { client, FOOTER_WAVE_COLOR_QUERY } from "@/lib/sanity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/footer-wave-color?path=/calendar
 * Returns { color: string | null } for the area above the footer (wave strip).
 * Used by the layout to set background per page from Sanity page document.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "";
  const slug = path.replace(/^\//, "").trim() || "home";

  if (!client) {
    return NextResponse.json({ color: null });
  }

  try {
    const color = await client.fetch<string | null>(FOOTER_WAVE_COLOR_QUERY, {
      slug,
    });
    return NextResponse.json({ color: color ?? null });
  } catch (e) {
    console.warn("footer-wave-color fetch failed:", e);
    return NextResponse.json({ color: null });
  }
}
