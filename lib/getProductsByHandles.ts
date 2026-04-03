import "server-only";
import { shopifyFetch, STOREFRONT_FETCH_REVALIDATE } from "@/lib/shopify";
import { sellingPlansFromVariantNode } from "@/lib/mapSellingPlans";
import type { ApiProductForCarousel } from "@/lib/types";

type VariantNode = {
  id: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  selectedOptions: Array<{ name: string; value: string }>;
  sellingPlanAllocations: {
    edges: Array<{
      node: {
        sellingPlan: { id: string; name: string };
        priceAdjustments?: Array<{
          perDeliveryPrice?: { amount: string; currencyCode: string } | null;
        }> | null;
      };
    }>;
  };
};

type ProductByHandleNode = {
  id: string;
  title: string;
  handle: string;
  requiresSellingPlan: boolean;
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
      requiresSellingPlan
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
            sellingPlanAllocations(first: 10) {
              edges {
                node {
                  sellingPlan { id name }
                  priceAdjustments {
                    perDeliveryPrice { amount currencyCode }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Normalizes pasted Shopify handles (strips slashes, "products/" prefix, etc.).
 * CMS users often paste `/handle` or `products/handle` from the storefront URL.
 */
export function normalizeShopifyProductHandle(raw: string): string {
  let h = raw.trim().replace(/^\/+|\/+$/g, "");
  if (h.toLowerCase().startsWith("products/")) {
    h = h.slice("products/".length).replace(/^\/+|\/+$/g, "");
  }
  return h;
}

/**
 * For Product Carousel “selected products” from Sanity, only one card per product is desired.
 * Otherwise one row per variant inflates the list and breaks the 2–5 layout / pagination UX.
 */
function pickPrimaryVariantEdge(
  edges: Array<{ node: VariantNode }>,
): { node: VariantNode } | undefined {
  const available = edges.find((e) => e.node.availableForSale);
  return available ?? edges[0];
}

/**
 * Fetches products by Shopify handle (server-only).
 * Returns array in the same order as handles; missing products are omitted.
 * On Storefront API failure (missing token, 401, network), returns [] so prerender/build can finish.
 *
 * @param oneVariantPerProduct — when true (Sanity Product Carousel picks), emit one row per handle
 *   using the first available-for-sale variant, or the first variant if none are available.
 */
export async function getProductsByHandles(
  handles: string[],
  options?: { oneVariantPerProduct?: boolean },
): Promise<ApiProductForCarousel[]> {
  const oneVariantPerProduct = Boolean(options?.oneVariantPerProduct);
  const trimmed = handles
    .map((h) => (typeof h === "string" ? normalizeShopifyProductHandle(h) : ""))
    .filter((h) => h.length > 0 && /^[a-zA-Z0-9-_]+$/.test(h));
  if (trimmed.length === 0) return [];

  try {
    const results = await Promise.all(
      trimmed.map((handle) =>
        shopifyFetch<ProductByHandleResponse, { handle: string }>({
          query: PRODUCT_BY_HANDLE_QUERY,
          variables: { handle },
          next: STOREFRONT_FETCH_REVALIDATE,
        })
      )
    );

    const products: ApiProductForCarousel[] = [];
    const nodes = results
      .map((data) => data.productByHandle)
      .filter((node): node is ProductByHandleNode => node != null);

    for (const node of nodes) {
      const variantEdges = node.variants?.edges ?? [];
      const defaultPrice = node.priceRange?.minVariantPrice;
      if (variantEdges.length === 0) {
        products.push({
          id: node.id,
          title: node.title,
          handle: node.handle,
          productType: null,
          filterValue: null,
          images: node.images,
          priceRange: defaultPrice ? { minVariantPrice: defaultPrice } : undefined,
          variantId: null,
          price: defaultPrice?.amount ?? "0",
          currencyCode: defaultPrice?.currencyCode ?? "USD",
          compareAtPrice: null,
          availableForSale: false,
          sizeOrDescription: null,
          requiresSellingPlan: node.requiresSellingPlan,
        });
      } else {
        const edgesToIterate = oneVariantPerProduct
          ? (() => {
              const primary = pickPrimaryVariantEdge(variantEdges);
              return primary ? [primary] : [];
            })()
          : variantEdges;
        for (const ve of edgesToIterate) {
          const variant = ve.node;
          const price = variant.price ?? defaultPrice;
          const compareAtPrice = variant.compareAtPrice?.amount
            ? variant.compareAtPrice
            : null;
          const sizeOrDescription =
            variant.selectedOptions?.map((o) => o.value).join(" / ") || null;
          const sellingPlans = sellingPlansFromVariantNode(variant);
          products.push({
            id: node.id,
            title: node.title,
            handle: node.handle,
            productType: null,
            filterValue: null,
            images: node.images,
            priceRange: price ? { minVariantPrice: price } : undefined,
            variantId: variant.id,
            price: price?.amount ?? "0",
            currencyCode: price?.currencyCode ?? "USD",
            compareAtPrice: compareAtPrice?.amount ?? null,
            availableForSale: variant.availableForSale ?? false,
            sizeOrDescription,
            requiresSellingPlan: node.requiresSellingPlan,
            ...(sellingPlans ? { sellingPlans } : {}),
          });
        }
      }
    }

    return products;
  } catch (err) {
    console.warn("getProductsByHandles: Shopify unavailable", err);
    return [];
  }
}
