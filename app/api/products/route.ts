import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";

type ProductsResponse = {
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
};

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
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
`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const first = Math.min(24, Math.max(1, parseInt(searchParams.get("first") ?? "9", 10)));

  try {
    const data = await shopifyFetch<ProductsResponse>({
      query: PRODUCTS_QUERY,
      variables: { first },
    });

    const products = data.products.edges.map((e) => e.node);

    return NextResponse.json({ products });
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch products." },
      { status: 500 }
    );
  }
}
