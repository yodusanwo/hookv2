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

type CartCreateResponse = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

type CartGetResponse = {
  cart: {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    lines: {
      edges: Array<{
        node: {
          id: string;
          quantity: number;
          merchandise: {
            id: string;
            title: string;
            product: { title: string; handle: string };
            price: { amount: string; currencyCode: string };
            image: { url: string; altText: string | null } | null;
          };
        };
      }>;
    };
    cost: { totalAmount: { amount: string; currencyCode: string } };
  } | null;
};

const CART_CREATE_MUTATION = `
  mutation CartCreate {
    cartCreate {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

const CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product { title handle }
                price { amount currencyCode }
                image { url altText }
              }
            }
          }
        }
      }
      cost { totalAmount { amount currencyCode } }
    }
  }
`;

export async function GET(req: NextRequest) {
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
    const data = await shopifyFetch<CartGetResponse, { cartId: string }>({
      query: CART_QUERY,
      variables: { cartId: normalizedId },
      cache: "no-store",
    });
    if (!data.cart) {
      return NextResponse.json(
        { error: "Cart not found or expired." },
        { status: 404 }
      );
    }
    return NextResponse.json(data.cart);
  } catch (err) {
    console.error("Get cart error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch cart." },
      { status: 500 }
    );
  }
}

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

