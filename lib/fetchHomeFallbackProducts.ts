import "server-only";

import { shopifyFetch } from "@/lib/shopify";
import {
  SHOPIFY_HOME_PRODUCTS_QUERY,
  type ShopifyHomeProductsResponse,
} from "@/lib/shopifyHomeProductsQuery";

const EMPTY: ShopifyHomeProductsResponse = {
  products: { edges: [] },
};

/**
 * Storefront products for the static home fallback (`HomePageFallback`).
 * Never throws: missing/invalid env or API errors yield an empty product list so
 * `next build` / prerender can complete (e.g. CI or Vercel before tokens are set).
 */
export async function fetchHomeFallbackProducts(): Promise<ShopifyHomeProductsResponse> {
  try {
    return await shopifyFetch<ShopifyHomeProductsResponse>({
      query: SHOPIFY_HOME_PRODUCTS_QUERY,
      variables: { first: 12 },
      next: { revalidate: 60 },
    });
  } catch (e) {
    console.warn(
      "Home fallback: Shopify products unavailable; using empty list. Check SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
      e
    );
    return EMPTY;
  }
}
