import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import type { ApiProductForCarousel } from "@/lib/types";

type ProductRecommendationsResponse = {
  productRecommendations: Array<{
    id: string;
    title: string;
    handle: string;
    productType: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: {
      edges: Array<{
        node: {
          id: string;
          price: { amount: string; currencyCode: string };
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
  }>;
};

const PRODUCT_RECOMMENDATIONS_QUERY = `
  query ProductRecommendations($productHandle: String!) {
    productRecommendations(productHandle: $productHandle) {
      id
      title
      handle
      productType
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 1) { edges { node { url altText } } }
      variants(first: 1) {
        edges {
          node {
            id
            price { amount currencyCode }
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

/**
 * GET /api/recommendations?productHandle=my-product
 * Uses Shopify's productRecommendations (Storefront API) to return related products.
 * Intent defaults to RELATED ("You may also like"). Pass intent=COMPLEMENTARY for "Pair it with" style.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productHandle = searchParams.get("productHandle")?.trim() ?? "";

  if (!productHandle) {
    return NextResponse.json(
      { error: "productHandle is required." },
      { status: 400 }
    );
  }

  try {
    const data = await shopifyFetch<
      ProductRecommendationsResponse,
      { productHandle: string }
    >({
      query: PRODUCT_RECOMMENDATIONS_QUERY,
      variables: { productHandle },
      cache: "no-store",
    });

    const nodes = data.productRecommendations ?? [];

    const products: ApiProductForCarousel[] = nodes.map((node) => {
      const variant = node.variants?.edges?.[0]?.node;
      const price = variant?.price ?? node.priceRange?.minVariantPrice;
      const sizeOrDescription =
        variant?.selectedOptions?.map((o) => o.value).join(" / ") || null;
      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        productType: node.productType ?? null,
        images: node.images,
        priceRange: { minVariantPrice: price },
        variantId: variant?.id ?? null,
        price: price?.amount ?? "0",
        currencyCode: price?.currencyCode ?? "USD",
        sizeOrDescription,
      };
    });

    return NextResponse.json({ products });
  } catch (err) {
    console.error("Recommendations fetch failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch recommendations.",
      },
      { status: 500 }
    );
  }
}
