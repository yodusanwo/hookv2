import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import { getFilterMetafieldConfigEscaped } from "@/lib/shopifyFilterMetafield";
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
  productType?: string | null;
  filterCategory?: { value?: string | null } | null;
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

function buildCollectionProductsQuery(): string {
  const meta = getFilterMetafieldConfigEscaped();
  const metafieldLine = meta
    ? `filterCategory: metafield(namespace: "${meta.namespace}", key: "${meta.key}") { value }`
    : "";
  return `
  query GetCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id title handle productType
            ${metafieldLine}
            priceRange { minVariantPrice { amount currencyCode } }
            images(first: 1) { edges { node { url altText } } }
            variants(first: 250) {
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
}

const DEFAULT_FIRST = 9;
const MAX_FIRST = 100;

export async function GET(
  req: Request,
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

  const url = new URL(req.url);
  const firstParam = url.searchParams.get("first");
  const first = Math.min(
    MAX_FIRST,
    Math.max(1, firstParam ? parseInt(firstParam, 10) || DEFAULT_FIRST : DEFAULT_FIRST)
  );

  try {
    const query = buildCollectionProductsQuery();
    const data = await shopifyFetch<CollectionProductsResponse>({
      query,
      variables: { handle: trimmed, first },
    });

    const collection = data.collection;
    const edges = collection?.products?.edges ?? [];

    const products: ApiProductForCarousel[] = [];

    for (const e of edges) {
      const node = e.node;
      const variantEdges = node.variants?.edges ?? [];
      const productType = node.productType ?? null;
      const filterValue =
        (node.filterCategory?.value != null && node.filterCategory.value !== ""
          ? node.filterCategory.value
          : null) ?? productType;

      if (variantEdges.length === 0) {
        const price = node.priceRange?.minVariantPrice;
        products.push({
          id: node.id,
          title: node.title,
          handle: node.handle,
          productType,
          filterValue: filterValue ?? null,
          images: node.images,
          priceRange: { minVariantPrice: price },
          variantId: null,
          price: price?.amount ?? "0",
          currencyCode: price?.currencyCode ?? "USD",
          compareAtPrice: null,
          availableForSale: false,
          sizeOrDescription: null,
        });
      } else {
        for (const ve of variantEdges) {
          const variant = ve.node;
          const price = variant.price ?? node.priceRange?.minVariantPrice;
          const compareAtPrice = variant.compareAtPrice?.amount
            ? variant.compareAtPrice
            : null;
          const sizeOrDescription =
            variant.selectedOptions?.map((o) => o.value).join(" / ") || null;
          products.push({
            id: variant.id,
            title: node.title,
            handle: node.handle,
            productType,
            filterValue: filterValue ?? null,
            images: node.images,
            priceRange: { minVariantPrice: price },
            variantId: variant.id,
            price: price?.amount ?? "0",
            currencyCode: price?.currencyCode ?? "USD",
            compareAtPrice: compareAtPrice?.amount ?? null,
            availableForSale: variant.availableForSale ?? false,
            sizeOrDescription,
          });
        }
      }
    }

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
