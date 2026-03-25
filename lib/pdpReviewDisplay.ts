import type { MappedReview, ReviewsSummary } from "@/lib/klaviyoReviews";
import { aggregatesFromShopifyReviewMetafields } from "@/lib/shopifyProductReviewAggregates";
import type { ReviewSummary } from "@/components/sections/ReviewsCarousel";

type ProductForReviewAgg = Parameters<typeof aggregatesFromShopifyReviewMetafields>[0];

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
      ? k.productReviewsForCarousel
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
