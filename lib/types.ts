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

/** Money from Storefront `MoneyV2`. */
export type MoneyBrief = { amount: string; currencyCode: string };

/** Selling plan from Storefront `sellingPlanAllocations` (subscriptions / Appstle). */
export type SellingPlanBrief = {
  id: string;
  name: string;
  /**
   * Effective price per delivery with this plan (first `priceAdjustments` entry).
   * When absent, UI falls back to the variant’s one-time price.
   */
  perDeliveryPrice?: MoneyBrief;
};

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
  /** From `Product.requiresSellingPlan` — subscription-only when true. */
  requiresSellingPlan?: boolean;
  /** Plans available for this variant (quick shop / PDP). */
  sellingPlans?: SellingPlanBrief[];
};
