import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";

type CollectionProductsResponse = {
  collection: {
    products: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
          images: { edges: Array<{ node: { url: string; altText: string | null } }> };
        };
      }>;
    };
  } | null;
};

const COLLECTION_PRODUCTS_QUERY = `
  query GetCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id title handle
            priceRange { minVariantPrice { amount currencyCode } }
            images(first: 1) { edges { node { url altText } } }
          }
        }
      }
    }
  }
`;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const trimmed = handle?.trim() ?? "";
  if (!trimmed || !/^[a-zA-Z0-9-]+$/.test(trimmed)) {
    return NextResponse.json(
      { error: "Invalid collection handle. Use only letters, numbers, and hyphens." },
      { status: 400 }
    );
  }

  try {
    const data = await shopifyFetch<CollectionProductsResponse>({
      query: COLLECTION_PRODUCTS_QUERY,
      variables: { handle: trimmed, first: 9 },
    });

    const collection = data.collection;
    const edges = collection?.products?.edges ?? [];

    return NextResponse.json({
      products: edges.map((e) => e.node),
    });
  } catch (err) {
    console.error("Failed to fetch collection products:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch products." },
      { status: 500 }
    );
  }
}
