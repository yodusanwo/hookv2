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

type CartDiscountCodesUpdateResponse = {
  cartDiscountCodesUpdate: {
    cart: {
      id: string;
      checkoutUrl: string;
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
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

const CART_DISCOUNT_CODES_UPDATE_MUTATION = `
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        id
        checkoutUrl
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
      userErrors { field message }
    }
  }
`;

export async function POST(req: NextRequest) {
  const limited = enforceApiRateLimit(req, "cartDiscount");
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const cartId = (body.cartId ?? "").trim();
    const rawCodes = body.discountCodes;
    const discountCodes = Array.isArray(rawCodes)
      ? rawCodes.map((c: unknown) => String(c).trim()).filter(Boolean)
      : typeof rawCodes === "string" && rawCodes.trim()
        ? [rawCodes.trim()]
        : [];

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
      CartDiscountCodesUpdateResponse,
      { cartId: string; discountCodes: string[] }
    >({
      query: CART_DISCOUNT_CODES_UPDATE_MUTATION,
      variables: { cartId: normalizedId, discountCodes },
      cache: "no-store",
    });

    const { cart, userErrors } = data.cartDiscountCodesUpdate;
    const firstError = userErrors?.[0]?.message;

    if (firstError) {
      return NextResponse.json(
        { error: firstError, userErrors, cart: cart ?? undefined },
        { status: 400 }
      );
    }

    if (!cart) {
      return NextResponse.json(
        { error: "Failed to update discount codes." },
        { status: 400 }
      );
    }

    return NextResponse.json({ cart, userErrors: [] });
  } catch (err) {
    console.error("Cart discount update error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to apply discount code." },
      { status: 500 }
    );
  }
}
