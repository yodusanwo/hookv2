import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";

function isValidShopifyGid(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && /^gid:\/\/shopify\/[\w-]+\/.+/.test(trimmed);
}

function toShopifyGid(type: "Cart" | "ProductVariant", value: string): string {
  const trimmed = value.trim();
  if (/^gid:\/\/shopify\//.test(trimmed)) return trimmed;
  const numeric = trimmed.replace(/\D/g, "");
  if (numeric.length > 0) return `gid://shopify/${type}/${numeric}`;
  return trimmed;
}

type CartLinesAddResponse = {
  cartLinesAdd: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { cartId?: string; merchandiseId?: string; quantity?: number }
    | null;

  const cartId =
    typeof body?.cartId === "string"
      ? body.cartId.trim()
      : body?.cartId != null
        ? String(body.cartId).trim()
        : "";
  const merchandiseId =
    typeof body?.merchandiseId === "string"
      ? body.merchandiseId.trim()
      : body?.merchandiseId != null
        ? String(body.merchandiseId).trim()
        : "";

  if (!cartId || !merchandiseId) {
    return NextResponse.json(
      { error: "cartId and merchandiseId are required." },
      { status: 400 }
    );
  }

  const quantity = Math.min(50, Math.max(1, Math.floor(Number(body?.quantity) || 1)));

  const normalizedCartId = toShopifyGid("Cart", cartId);
  const normalizedMerchandiseId = toShopifyGid("ProductVariant", merchandiseId);

  if (!isValidShopifyGid(normalizedCartId) || !isValidShopifyGid(normalizedMerchandiseId)) {
    return NextResponse.json(
      { error: "Invalid cartId or merchandiseId format." },
      { status: 400 }
    );
  }

  const data = await shopifyFetch<CartLinesAddResponse, Record<string, unknown>>({
    query: CART_LINES_ADD_MUTATION,
    variables: {
      cartId: normalizedCartId,
      lines: [{ merchandiseId: normalizedMerchandiseId, quantity }],
    },
  });

  const err = data.cartLinesAdd.userErrors?.[0];
  if (!data.cartLinesAdd.cart || err) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to add item to cart." },
      { status: 400 }
    );
  }

  return NextResponse.json(data.cartLinesAdd.cart);
}

