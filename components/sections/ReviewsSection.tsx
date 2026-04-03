import { SectionHeading } from "@/components/ui/SectionHeading";
import { getKlaviyoReviewsForSection } from "@/lib/klaviyoReviews";
import { ReviewsCarousel } from "./ReviewsCarousel";

type Review = { stars?: number; text?: string; name?: string; date?: string; createdAt?: string };

type ReviewsBlock = {
  backgroundColor?: string;
  title?: string;
  description?: string;
  reviews?: Review[];
};

export async function ReviewsSection({ block }: { block: ReviewsBlock }) {
  const title = block.title ?? "REVIEWS";
  const description = block.description ?? "";
  const sanityReviews = block.reviews ?? [];

  let reviews: Review[] = [];
  try {
    const klaviyoReviews = await getKlaviyoReviewsForSection();
    if (klaviyoReviews.length > 0) {
      reviews = klaviyoReviews;
    } else {
      reviews = sanityReviews;
    }
  } catch {
    reviews = sanityReviews;
  }

  if (reviews.length === 0) return null;

  reviews = [...reviews].sort((a, b) => {
    const t1 = a.createdAt ?? "";
    const t2 = b.createdAt ?? "";
    if (t1 && t2) return t2.localeCompare(t1);
    if (t1) return -1;
    if (t2) return 1;
    return 0;
  });

  const bgColor = block.backgroundColor ?? "#F8F8F8";
  return (
    <section
      className="flex min-h-0 flex-col justify-center py-12 md:py-14"
      style={{ backgroundColor: bgColor, ["--section-bg" as string]: bgColor }}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="section"
        />
        <ReviewsCarousel reviews={reviews} />
      </div>
    </section>
  );
}
