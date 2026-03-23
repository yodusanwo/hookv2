/**
 * Shared types for section filters (collection label + handle).
 * Used by Product Carousel (Catch of the Day) and Explore Products sections.
 */
export type FilterItem = { label?: string; collectionHandle?: string };

/**
 * Product shape returned by /api/collections/[handle]/products and /api/products.
 * Used by Product Carousel grid; must match the normalized payload from both APIs.
 */
/** Unique key for list rows when one product may map to multiple variant cards. */
export function carouselProductRowKey(p: {
  id: string;
  variantId?: string | null;
}): string {
  return p.variantId ?? p.id;
}

export type ApiProductForCarousel = {
  /** Shopify product GID (stable product identity). */
  id: string;
  title: string;
  handle: string;
  /** Used for /shop filter: metafield value (e.g. Seafood type) when configured, else productType. */
  productType?: string | null;
  filterValue?: string | null;
  images?: {
    edges?: Array<{ node?: { url?: string; altText?: string | null } }>;
  };
  price?: string;
  currencyCode?: string;
  priceRange?: { minVariantPrice?: { amount?: string; currencyCode?: string } };
  variantId?: string | null;
  compareAtPrice?: string | null;
  availableForSale?: boolean;
  sizeOrDescription?: string | null;
};
