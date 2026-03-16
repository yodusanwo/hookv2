import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import type { ApiProductForCarousel } from "@/lib/types";

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
  productType?: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: { edges: Array<{ node: VariantNode }> };
};

type ProductsResponse = {
  products: { edges: Array<{ node: ProductNode }> };
};

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id title handle productType
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
`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = parseInt(searchParams.get("first") ?? "9", 10);
  const first = Number.isNaN(parsed) ? 9 : Math.min(24, Math.max(1, parsed));

  try {
    const data = await shopifyFetch<ProductsResponse>({
      query: PRODUCTS_QUERY,
      variables: { first },
    });

    const products: ApiProductForCarousel[] = data.products.edges.map((e) => {
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
        productType: node.productType ?? null,
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
    console.error("Failed to fetch products:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to fetch products.",
      },
      { status: 500 },
    );
  }
}
