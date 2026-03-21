/**
 * Shopify standard product review aggregates (`reviews.rating`, `reviews.rating_count`).
 * Populated by review apps (e.g. Judge.me) participating in Shopify’s review syndication.
 * Use when Klaviyo Reviews has no rows for the product but the theme still shows stars/count.
 *
 * @see https://shopify.dev/docs/apps/build/custom-data/metaobjects/standard-review-metaobject
 */

export type ProductReviewAggregates = { count: number; averageRating: number };

type MetafieldVal = { value?: string } | null | undefined;

export function aggregatesFromShopifyReviewMetafields(product: {
  reviewsRating?: MetafieldVal;
  reviewsRatingCount?: MetafieldVal;
}): ProductReviewAggregates {
  const countRaw = product.reviewsRatingCount?.value?.trim();
  let count = 0;
  if (countRaw) {
    const n = parseInt(countRaw, 10);
    if (Number.isFinite(n) && n >= 0) count = n;
  }

  let averageRating = 0;
  const ratingRaw = product.reviewsRating?.value?.trim();
  if (ratingRaw) {
    try {
      const j = JSON.parse(ratingRaw) as { value?: string | number };
      const v =
        j.value != null ? parseFloat(String(j.value)) : Number.NaN;
      if (Number.isFinite(v) && v >= 0 && v <= 5) {
        averageRating = Math.round(v * 10) / 10;
      }
    } catch {
      /* invalid JSON */
    }
  }

  return { count, averageRating };
}
