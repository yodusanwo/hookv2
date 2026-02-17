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
    <section className="py-14 bg-[#F2F2F5]">
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
              className="flex h-[273px] w-[355px] flex-col rounded-xl border border-black/5 bg-[#FFF] p-6 text-center"
            >
              {r.stars != null && (
                <div className="flex justify-center gap-0.5 text-[#FFC107]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < Math.min(5, r.stars) ? "★" : "☆"}</span>
                  ))}
                </div>
              )}
              <p className="mt-4 flex-1 min-h-0 overflow-y-auto text-base leading-relaxed text-[#333]">
                {r.text}
              </p>
              <p className="mt-4 text-sm font-semibold text-[#333]">{r.name}</p>
              {r.date && (
                <p className="mt-1 text-xs text-[#666]">{r.date}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
