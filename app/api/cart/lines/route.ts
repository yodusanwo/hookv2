import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";

function isValidShopifyGid(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && /^gid:\/\/shopify\/[\w-]+\/.+/.test(trimmed);
}

function toShopifyGid(
  type: "Cart" | "ProductVariant" | "CartLine",
  value: string
): string {
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

type CartLinesUpdateResponse = {
  cartLinesUpdate: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

type CartLinesRemoveResponse = {
  cartLinesRemove: {
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

const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
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

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { cartId?: string; lines?: Array<{ id: string; quantity: number }> }
    | null;
  const cartId =
    typeof body?.cartId === "string" ? body.cartId.trim() : "";
  const lines = Array.isArray(body?.lines) ? body.lines : [];
  if (!cartId || lines.length === 0) {
    return NextResponse.json(
      { error: "cartId and lines (id, quantity) are required." },
      { status: 400 }
    );
  }
  const normalizedCartId = toShopifyGid("Cart", cartId);
  if (!isValidShopifyGid(normalizedCartId)) {
    return NextResponse.json(
      { error: "Invalid cartId format." },
      { status: 400 }
    );
  }
  const updateLines = lines
    .filter((l) => l?.id && Number.isFinite(l.quantity))
    .map((l) => ({
      id: toShopifyGid("CartLine", l.id),
      quantity: Math.min(50, Math.max(1, Math.floor(Number(l.quantity) || 1))),
    }))
    .filter((l) => l.quantity >= 1);
  if (updateLines.length === 0) {
    return NextResponse.json(
      { error: "Valid lines with id and quantity required." },
      { status: 400 }
    );
  }
  const data = await shopifyFetch<CartLinesUpdateResponse, Record<string, unknown>>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId: normalizedCartId, lines: updateLines },
  });
  const err = data.cartLinesUpdate.userErrors?.[0];
  if (!data.cartLinesUpdate.cart || err) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to update cart lines." },
      { status: 400 }
    );
  }
  return NextResponse.json(data.cartLinesUpdate.cart);
}

export async function DELETE(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { cartId?: string; lineIds?: string[] }
    | null;
  const cartId =
    typeof body?.cartId === "string" ? body.cartId.trim() : "";
  const lineIdsRaw = Array.isArray(body?.lineIds) ? body.lineIds : [];
  if (!cartId || lineIdsRaw.length === 0) {
    return NextResponse.json(
      { error: "cartId and lineIds are required." },
      { status: 400 }
    );
  }
  if (lineIdsRaw.some((id) => typeof id !== "string")) {
    return NextResponse.json(
      { error: "Every lineId must be a string." },
      { status: 400 }
    );
  }
  const normalizedCartId = toShopifyGid("Cart", cartId);
  if (!isValidShopifyGid(normalizedCartId)) {
    return NextResponse.json(
      { error: "Invalid cartId format." },
      { status: 400 }
    );
  }
  const ids = (lineIdsRaw as string[])
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => toShopifyGid("CartLine", id))
    .filter((id) => isValidShopifyGid(id));
  if (ids.length === 0) {
    return NextResponse.json(
      { error: "At least one valid lineId is required." },
      { status: 400 }
    );
  }
  const data = await shopifyFetch<CartLinesRemoveResponse, Record<string, unknown>>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId: normalizedCartId, lineIds: ids },
  });
  const err = data.cartLinesRemove.userErrors?.[0];
  if (!data.cartLinesRemove.cart || err) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to remove cart lines." },
      { status: 400 }
    );
  }
  return NextResponse.json(data.cartLinesRemove.cart);
}

