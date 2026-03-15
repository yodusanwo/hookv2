import { NextRequest, NextResponse } from "next/server";
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

type CartNoteUpdateResponse = {
  cartNoteUpdate: {
    cart: { id: string; note: string | null } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

const CART_NOTE_UPDATE_MUTATION = `
  mutation CartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart { id note }
      userErrors { field message }
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const cartId = (body.cartId ?? "").trim();
    const note = typeof body.note === "string" ? body.note : "";

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

    const data = await shopifyFetch<
      CartNoteUpdateResponse,
      { cartId: string; note: string }
    >({
      query: CART_NOTE_UPDATE_MUTATION,
      variables: { cartId: normalizedId, note },
      cache: "no-store",
    });

    const { cart, userErrors } = data.cartNoteUpdate;
    const firstError = userErrors?.[0]?.message;

    if (firstError) {
      return NextResponse.json(
        { error: firstError, userErrors },
        { status: 400 }
      );
    }

    return NextResponse.json({ cart, userErrors: [] });
  } catch (err) {
    console.error("Cart note update error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update note." },
      { status: 500 }
    );
  }
}
