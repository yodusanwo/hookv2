import { getKlaviyoReviewSummaryForProduct } from "@/lib/klaviyoReviews";
import { heroReviewCountFromProductAndKlaviyo } from "@/lib/pdpReviewDisplay";

type ProductForHeroCount = {
  id: string;
  reviewsRating?: { value: string } | null;
  reviewsRatingCount?: { value: string } | null;
};

/** Streams after the PDP shell; keeps Klaviyo+Shopify count logic identical to the former inline path. */
export async function PdpHeroReviewCount({
  product,
}: {
  product: ProductForHeroCount;
}) {
  const productScopedReviewSummary = await getKlaviyoReviewSummaryForProduct(
    product.id,
  );
  const n = heroReviewCountFromProductAndKlaviyo(
    product,
    productScopedReviewSummary,
  );
  return (
    <>
      {n} {n === 1 ? "review" : "reviews"}
    </>
  );
}
