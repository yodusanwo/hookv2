import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";

type CartCreateResponse = {
  cartCreate: {
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

export async function POST() {
  const data = await shopifyFetch<CartCreateResponse>({ query: CART_CREATE_MUTATION });
  const err = data.cartCreate.userErrors?.[0];
  if (!data.cartCreate.cart || err) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to create cart." },
      { status: 400 }
    );
  }

  return NextResponse.json(data.cartCreate.cart);
}

