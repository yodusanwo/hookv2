import { getPdpReviewData } from "@/lib/klaviyoReviews";
import { derivePdpReviewCarouselState } from "@/lib/pdpReviewDisplay";
import { ReviewsCarousel } from "@/components/sections/ReviewsCarousel";
import { SectionHeading } from "@/components/ui/SectionHeading";

type ProductForReviews = {
  id: string;
  reviewsRating?: { value: string } | null;
  reviewsRatingCount?: { value: string } | null;
};

export async function PdpReviewsSection({
  product,
}: {
  product: ProductForReviews;
}) {
  const k = await getPdpReviewData(product.id);
  const { reviewsToShow, productReviewSummary } = derivePdpReviewCarouselState(
    product,
    k,
  );

  return (
    <section
      className="flex min-h-0 flex-col justify-center pb-12 md:pb-14 pt-28 md:pt-[clamp(5rem,12vw,8rem)]"
      style={{
        backgroundColor: "#F8F8F8",
        ["--section-bg" as string]: "#F8F8F8",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-4">
        <SectionHeading
          title="Reviews"
          description="What our customers are saying."
          variant="section"
        />
        {reviewsToShow.length > 0 ? (
          <ReviewsCarousel
            reviews={reviewsToShow}
            reviewSummary={productReviewSummary}
            expandFirstReviewFullText
          />
        ) : (
          <p className="mt-10 text-center section-description-block">
            No reviews yet. Be the first to leave a review after your purchase.
          </p>
        )}
      </div>
    </section>
  );
}
