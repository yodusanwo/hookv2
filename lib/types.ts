/**
 * Shared types for section filters (collection label + handle).
 * Used by Product Carousel (Catch of the Day) and Explore Products sections.
 */
export type FilterItem = { label?: string; collectionHandle?: string };

/**
 * Product shape returned by /api/collections/[handle]/products and /api/products.
 * Used by Product Carousel grid; must match the normalized payload from both APIs.
 */
export type ApiProductForCarousel = {
  id: string;
  title: string;
  handle: string;
  images?: { edges?: Array<{ node?: { url?: string; altText?: string | null } }> };
  price?: string;
  currencyCode?: string;
  priceRange?: { minVariantPrice?: { amount?: string; currencyCode?: string } };
  variantId?: string | null;
  compareAtPrice?: string | null;
  availableForSale?: boolean;
  sizeOrDescription?: string | null;
};
