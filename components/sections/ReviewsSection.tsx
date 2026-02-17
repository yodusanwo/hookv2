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
    <section className="py-14 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-center text-sm text-slate-600">{description}</p>
        )}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-black/5 bg-slate-50 p-6"
            >
              {r.stars != null && (
                <div className="flex gap-0.5 text-amber-500" aria-hidden>
                  {Array.from({ length: Math.min(5, r.stars) }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              )}
              <p className="mt-3 text-sm text-slate-700">{r.text}</p>
              <p className="mt-3 text-xs font-semibold text-slate-600">
                {r.name} {r.date && `• ${r.date}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
