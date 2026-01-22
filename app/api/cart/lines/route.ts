import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";

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

  if (!body?.cartId || !body?.merchandiseId) {
    return NextResponse.json(
      { error: "cartId and merchandiseId are required." },
      { status: 400 }
    );
  }

  const quantity = Number.isFinite(body.quantity) ? Number(body.quantity) : 1;

  const data = await shopifyFetch<CartLinesAddResponse, any>({
    query: CART_LINES_ADD_MUTATION,
    variables: {
      cartId: body.cartId,
      lines: [{ merchandiseId: body.merchandiseId, quantity }],
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

