import "server-only";
import { shopifyFetch } from "@/lib/shopify";
import type { ApiProductForCarousel } from "@/lib/types";

type VariantNode = {
  id: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  selectedOptions: Array<{ name: string; value: string }>;
};

type ProductByHandleNode = {
  id: string;
  title: string;
  handle: string;
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: { edges: Array<{ node: VariantNode }> };
  priceRange?: { minVariantPrice?: { amount: string; currencyCode: string } };
};

type ProductByHandleResponse = {
  productByHandle: ProductByHandleNode | null;
};

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
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
`;

/**
 * Fetches products by Shopify handle (server-only).
 * Returns array in the same order as handles; missing products are omitted.
 */
export async function getProductsByHandles(
  handles: string[]
): Promise<ApiProductForCarousel[]> {
  const trimmed = handles
    .map((h) => (typeof h === "string" ? h.trim() : ""))
    .filter((h) => h.length > 0 && /^[a-zA-Z0-9-_]+$/.test(h));
  if (trimmed.length === 0) return [];

  const results = await Promise.all(
    trimmed.map((handle) =>
      shopifyFetch<ProductByHandleResponse, { handle: string }>({
        query: PRODUCT_BY_HANDLE_QUERY,
        variables: { handle },
      })
    )
  );

  return results
    .map((data) => data.productByHandle)
    .filter((node): node is ProductByHandleNode => node != null)
    .map((node) => {
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
        productType: null,
        filterValue: null,
        images: node.images,
        priceRange: price ? { minVariantPrice: price } : undefined,
        variantId: variant?.id ?? null,
        price: price?.amount ?? "0",
        currencyCode: price?.currencyCode ?? "USD",
        compareAtPrice: compareAtPrice?.amount ?? null,
        availableForSale: variant?.availableForSale ?? false,
        sizeOrDescription,
      };
    });
}
