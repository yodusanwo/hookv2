import { NextResponse } from "next/server";
import { enforceApiRateLimit } from "@/lib/apiRateLimit";
import { shopifyFetch } from "@/lib/shopify";

type SearchProductNode = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText: string | null } | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  compareAtPriceRange?: {
    minVariantPrice: { amount: string; currencyCode: string };
  } | null;
};

type SearchResponse = {
  search: {
    nodes: SearchProductNode[];
    totalCount: number;
  };
};

const SEARCH_QUERY = `
  query SearchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: [PRODUCT]) {
      totalCount
      nodes {
        ... on Product {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export type SearchProduct = {
  id: string;
  title: string;
  handle: string;
  image: string | null;
  altText: string | null;
  price: string;
  currencyCode: string;
  compareAtPrice: string | null;
};

export async function GET(req: Request) {
  const limited = enforceApiRateLimit(req, "search");
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const first = Math.min(24, Math.max(1, parseInt(searchParams.get("first") ?? "12", 10) || 12));

  if (!q) {
    return NextResponse.json({ products: [], totalCount: 0 });
  }

  try {
    const data = await shopifyFetch<SearchResponse>({
      query: SEARCH_QUERY,
      variables: { query: q, first },
      next: { revalidate: 60 },
    });

    const products: SearchProduct[] = (data.search?.nodes ?? [])
      .filter((n): n is SearchProductNode => n && "handle" in n && typeof n.handle === "string")
      .map((node) => {
        const price = node.priceRange?.minVariantPrice;
        const compareAt = node.compareAtPriceRange?.minVariantPrice;
        return {
          id: node.id,
          title: node.title,
          handle: node.handle,
          image: node.featuredImage?.url ?? null,
          altText: node.featuredImage?.altText ?? null,
          price: price?.amount ?? "0",
          currencyCode: price?.currencyCode ?? "USD",
          compareAtPrice: compareAt?.amount ? compareAt.amount : null,
        };
      });

    return NextResponse.json({
      products,
      totalCount: data.search?.totalCount ?? 0,
    });
  } catch (err) {
    console.error("Search failed:", err);
    return NextResponse.json(
      { products: [], totalCount: 0, error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 }
    );
  }
}
