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

/**
 * GET /api/shipping-settings
 * Returns { freeShippingThreshold: number | null, freeShippingMessage: string | null } for the cart page.
 */
export async function GET() {
  if (!client) {
    return NextResponse.json({
      freeShippingThreshold: null,
      freeShippingMessage: null,
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
        : null;
    const freeShippingMessage =
      typeof data?.freeShippingMessage === "string" &&
      data.freeShippingMessage.trim() !== ""
        ? data.freeShippingMessage.trim()
        : null;
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
