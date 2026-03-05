import { SectionHeading } from "@/components/ui/SectionHeading";
import { getKlaviyoReviews } from "@/lib/klaviyoReviews";

type Review = { stars?: number; text?: string; name?: string; date?: string };

type ReviewsBlock = {
  title?: string;
  description?: string;
  reviews?: Review[];
};

export async function ReviewsSection({ block }: { block: ReviewsBlock }) {
  const title = block.title ?? "Customer Reviews";
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

  return (
    <section className="flex min-h-0 flex-col justify-center section-bg-light py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
        />
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className="flex h-[273px] w-[355px] flex-col justify-center rounded-xl border border-black/5 bg-[#FFF] p-6 text-center"
            >
              {r.stars != null && (
                <div
                  className="flex justify-center items-center gap-0.5"
                  style={{ color: "#FFA100" }}
                  aria-hidden
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="flex items-center justify-center"
                      style={{ width: 24, height: 24, fontSize: 24, lineHeight: 1 }}
                    >
                      {i < Math.min(5, r.stars ?? 0) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
              )}
              <p
                className="mt-4 min-h-0 overflow-y-auto mx-auto"
                style={{
                  width: 220,
                  color: "#1E1E1E",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 16,
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                }}
              >
                {r.text}
              </p>
              <p
                className="mt-4"
                style={{
                  color: "#1E1E1E",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 16,
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                }}
              >
                {r.name}
              </p>
              {r.date && (
                <p
                  className="mt-1"
                  style={{
                    color: "#1E1E1E",
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: 12,
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                  }}
                >
                  {r.date}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
