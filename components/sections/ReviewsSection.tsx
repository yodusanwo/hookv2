import { getKlaviyoReviews } from "@/lib/klaviyoReviews";
import { ReviewsCarousel } from "./ReviewsCarousel";

type Review = { stars?: number; text?: string; name?: string; date?: string };

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
    const klaviyoReviews = await getKlaviyoReviews();
    reviews = klaviyoReviews.length > 0 ? klaviyoReviews : sanityReviews;
  } catch {
    reviews = sanityReviews;
  }

  if (reviews.length === 0) return null;

  const bgColor = block.backgroundColor ?? "#F8F8F8";
  return (
    <section
      className="flex min-h-0 flex-col justify-center py-14"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-4">
        <h2
          className="text-center uppercase tracking-wide"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "clamp(28px, 6vw, 48px)",
            fontWeight: 700,
            lineHeight: "normal",
            color: "#333333",
          }}
        >
          {title}
        </h2>
        {description ? (
          <p
            className="mt-4 w-full max-w-[770px] mx-auto text-center"
            style={{
              color: "#333333",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 17,
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        ) : null}
        <ReviewsCarousel reviews={reviews} />
      </div>
    </section>
  );
}
