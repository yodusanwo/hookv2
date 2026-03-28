import { NextRequest, NextResponse } from "next/server";
import { enforceApiRateLimit } from "@/lib/apiRateLimit";
import { shopifyFetch } from "@/lib/shopify";

function toShopifyCartGid(value: string): string {
  const trimmed = value.trim();
  if (/^gid:\/\/shopify\//.test(trimmed)) return trimmed;
  const numeric = trimmed.replace(/\D/g, "");
  if (numeric.length > 0) return `gid://shopify/Cart/${numeric}`;
  return trimmed;
}

function isValidShopifyGid(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  return value.trim().length > 0 && /^gid:\/\/shopify\/[\w-]+\/.+/.test(value.trim());
}

type CartCountResponse = {
  cart: { totalQuantity: number } | null;
};

const CART_COUNT_QUERY = `
  query GetCartCount($cartId: ID!) {
    cart(id: $cartId) {
      totalQuantity
    }
  }
`;

export async function GET(req: NextRequest) {
  const limited = enforceApiRateLimit(req, "cartCount");
  if (limited) return limited;

  const cartId = req.nextUrl.searchParams.get("cartId")?.trim() ?? "";
  if (!cartId) {
    return NextResponse.json(
      { error: "cartId is required." },
      { status: 400 }
    );
  }
  const normalizedId = toShopifyCartGid(cartId);
  if (!isValidShopifyGid(normalizedId)) {
    return NextResponse.json(
      { error: "Invalid cartId format." },
      { status: 400 }
    );
  }
  try {
    const data = await shopifyFetch<CartCountResponse, { cartId: string }>({
      query: CART_COUNT_QUERY,
      variables: { cartId: normalizedId },
      cache: "no-store",
    });
    if (!data.cart) {
      return NextResponse.json(
        { error: "Cart not found or expired." },
        { status: 404 }
      );
    }
    return NextResponse.json({ totalQuantity: data.cart.totalQuantity });
  } catch (err) {
    console.error("Get cart count error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch cart count." },
      { status: 500 }
    );
  }
}
