import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ShippingSettings = {
  freeShippingMessage?: string | null;
  freeShippingThreshold?: number | null;
};

const SHIPPING_SETTINGS_QUERY = `*[_type == "siteSettings"][0] {
  freeShippingMessage,
  freeShippingThreshold
}`;

/** Default threshold (USD) when not set in Sanity, so cart always shows free-shipping progress. */
const DEFAULT_FREE_SHIPPING_THRESHOLD = 50;

/**
 * GET /api/shipping-settings
 * Returns { freeShippingThreshold: number | null, freeShippingMessage: string | null } for the cart page.
 */
export async function GET() {
  if (!client) {
    return NextResponse.json({
      freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
      freeShippingMessage: `Free shipping for orders over $${DEFAULT_FREE_SHIPPING_THRESHOLD}`,
    });
  }

  try {
    const data = await client.fetch<ShippingSettings | null>(
      SHIPPING_SETTINGS_QUERY
    );
    const freeShippingThreshold =
      typeof data?.freeShippingThreshold === "number" &&
      Number.isFinite(data.freeShippingThreshold)
        ? data.freeShippingThreshold
        : DEFAULT_FREE_SHIPPING_THRESHOLD;
    const freeShippingMessage =
      typeof data?.freeShippingMessage === "string" &&
      data.freeShippingMessage.trim() !== ""
        ? data.freeShippingMessage.trim()
        : `Free shipping for orders over $${freeShippingThreshold}`;
    return NextResponse.json({
      freeShippingThreshold,
      freeShippingMessage,
    });
  } catch (e) {
    console.warn("shipping-settings fetch failed:", e);
    return NextResponse.json({
      freeShippingThreshold: null,
      freeShippingMessage: null,
    });
  }
}
