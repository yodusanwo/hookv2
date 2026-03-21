import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";

function isValidShopifyGid(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && /^gid:\/\/shopify\/[\w-]+\/.+/.test(trimmed);
}

function toShopifyGid(
  type: "Cart" | "ProductVariant",
  value: string,
): string {
  const trimmed = value.trim();
  if (/^gid:\/\/shopify\//.test(trimmed)) return trimmed;
  const numeric = trimmed.replace(/\D/g, "");
  if (numeric.length > 0) return `gid://shopify/${type}/${numeric}`;
  return trimmed;
}

type CartCreateResponse = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

type CartLinesAddResponse = {
  cartLinesAdd: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

const CART_CREATE_MUTATION = `
  mutation CartCreate {
    cartCreate {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

/**
 * Headless "Buy now": new cart with a single line, returns Shopify checkout URL.
 * Does not use the browser's persisted cart id so checkout starts clean for this flow.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { merchandiseId?: string; quantity?: number }
    | null;

  const merchandiseId =
    typeof body?.merchandiseId === "string"
      ? body.merchandiseId.trim()
      : body?.merchandiseId != null
        ? String(body.merchandiseId).trim()
        : "";

  if (!merchandiseId) {
    return NextResponse.json(
      { error: "merchandiseId is required." },
      { status: 400 },
    );
  }

  const quantity = Math.min(
    50,
    Math.max(1, Math.floor(Number(body?.quantity) || 1)),
  );

  const normalizedVariantId = toShopifyGid("ProductVariant", merchandiseId);
  if (!isValidShopifyGid(normalizedVariantId)) {
    return NextResponse.json(
      { error: "Invalid merchandiseId format." },
      { status: 400 },
    );
  }

  const created = await shopifyFetch<CartCreateResponse>({
    query: CART_CREATE_MUTATION,
  });
  const createErr = created.cartCreate.userErrors?.[0];
  const cartId = created.cartCreate.cart?.id;
  if (!cartId || createErr) {
    return NextResponse.json(
      { error: createErr?.message ?? "Failed to create cart." },
      { status: 400 },
    );
  }

  const data = await shopifyFetch<CartLinesAddResponse, Record<string, unknown>>({
    query: CART_LINES_ADD_MUTATION,
    variables: {
      cartId,
      lines: [{ merchandiseId: normalizedVariantId, quantity }],
    },
  });

  const err = data.cartLinesAdd.userErrors?.[0];
  if (!data.cartLinesAdd.cart || err) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to start checkout." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    checkoutUrl: data.cartLinesAdd.cart.checkoutUrl,
    cartId: data.cartLinesAdd.cart.id,
  });
}
