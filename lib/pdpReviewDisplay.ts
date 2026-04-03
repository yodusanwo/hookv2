import type { MappedReview, ReviewsSummary } from "@/lib/klaviyoReviews";
import { aggregatesFromShopifyReviewMetafields } from "@/lib/shopifyProductReviewAggregates";
import type { ReviewSummary } from "@/components/sections/ReviewsCarousel";

type ProductForReviewAgg = Parameters<typeof aggregatesFromShopifyReviewMetafields>[0];

/** PDP carousel shows up to three cards; pad with featured Klaviyo reviews when product has fewer. */
const PDP_CAROUSEL_TARGET_COUNT = 3;

function reviewDedupeKey(r: MappedReview): string {
  return `${r.createdAt ?? ""}|${r.name}|${r.text.trim().slice(0, 240)}`;
}

/**
 * Product-specific reviews first (newest first), then **featured** reviews until
 * {@link PDP_CAROUSEL_TARGET_COUNT} items or pools are exhausted. Skips duplicates.
 */
function mergeProductReviewsWithFeaturedFallback(
  productReviews: MappedReview[],
  featuredReviews: MappedReview[],
): MappedReview[] {
  if (productReviews.length === 0) return featuredReviews;
  if (productReviews.length >= PDP_CAROUSEL_TARGET_COUNT) return productReviews;

  const seen = new Set(productReviews.map(reviewDedupeKey));
  const merged = [...productReviews];
  for (const r of featuredReviews) {
    if (merged.length >= PDP_CAROUSEL_TARGET_COUNT) break;
    const key = reviewDedupeKey(r);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(r);
  }
  return merged;
}

export function heroReviewCountFromProductAndKlaviyo(
  product: ProductForReviewAgg,
  productScopedReviewSummary: ReviewsSummary,
): number {
  const shopifyReviewAgg = aggregatesFromShopifyReviewMetafields(product);
  return productScopedReviewSummary.totalCount > 0
    ? productScopedReviewSummary.totalCount
    : shopifyReviewAgg.count;
}

export function derivePdpReviewCarouselState(
  product: ProductForReviewAgg,
  k: {
    sectionReviews: MappedReview[];
    storeReviewSummary: ReviewsSummary;
    productReviewsForCarousel: MappedReview[];
    productScopedReviewSummary: ReviewsSummary;
  },
): {
  reviewsToShow: MappedReview[];
  productReviewSummary: ReviewSummary | null;
} {
  const shopifyReviewAgg = aggregatesFromShopifyReviewMetafields(product);
  const reviewsToShow =
    k.productReviewsForCarousel.length > 0
      ? mergeProductReviewsWithFeaturedFallback(
          k.productReviewsForCarousel,
          k.sectionReviews,
        )
      : k.sectionReviews;
  const productReviewSummary =
    k.productReviewsForCarousel.length > 0
      ? k.productScopedReviewSummary.totalCount > 0 ||
          k.productScopedReviewSummary.averageRating > 0
        ? k.productScopedReviewSummary
        : null
      : shopifyReviewAgg.count > 0 || shopifyReviewAgg.averageRating > 0
        ? {
            totalCount: shopifyReviewAgg.count,
            averageRating: shopifyReviewAgg.averageRating,
          }
        : k.storeReviewSummary.totalCount > 0 || k.storeReviewSummary.averageRating > 0
          ? k.storeReviewSummary
          : null;

  return { reviewsToShow, productReviewSummary };
}
