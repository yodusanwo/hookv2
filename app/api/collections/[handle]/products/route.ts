import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";

type VariantNode = {
  id: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  selectedOptions: Array<{ name: string; value: string }>;
};

type ProductNode = {
  id: string;
  title: string;
  handle: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: { edges: Array<{ node: VariantNode }> };
};

type CollectionProductsResponse = {
  collection: {
    products: {
      edges: Array<{ node: ProductNode }>;
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
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const trimmed = handle?.trim() ?? "";
  if (!trimmed || !/^[a-zA-Z0-9-]+$/.test(trimmed)) {
    return NextResponse.json(
      {
        error:
          "Invalid collection handle. Use only letters, numbers, and hyphens.",
      },
      { status: 400 },
    );
  }

  try {
    const data = await shopifyFetch<CollectionProductsResponse>({
      query: COLLECTION_PRODUCTS_QUERY,
      variables: { handle: trimmed, first: 9 },
    });

    const collection = data.collection;
    const edges = collection?.products?.edges ?? [];

    const products = edges.map((e) => {
      const node = e.node;
      const variant = node.variants?.edges?.[0]?.node;
      const price = variant?.price ?? node.priceRange?.minVariantPrice;
      const compareAtPrice = variant?.compareAtPrice?.amount
        ? variant.compareAtPrice
        : null;
      const sizeOrDescription =
        variant?.selectedOptions?.map((o) => o.value).join(" / ") || null;
      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        images: node.images,
        priceRange: { minVariantPrice: price },
        variantId: variant?.id ?? null,
        price: price?.amount ?? "0",
        currencyCode: price?.currencyCode ?? "USD",
        compareAtPrice: compareAtPrice?.amount ?? null,
        availableForSale: variant?.availableForSale ?? false,
        sizeOrDescription,
      };
    });

    return NextResponse.json({ products });
  } catch (err) {
    console.error("Failed to fetch collection products:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to fetch products.",
      },
      { status: 500 },
    );
  }
}
