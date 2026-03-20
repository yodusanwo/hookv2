"use client";

import * as React from "react";

export type ReviewItem = {
  stars?: number;
  text?: string;
  name?: string;
  date?: string;
};

export type ReviewSummary = { totalCount: number; averageRating: number };

function ReviewSummaryCard({
  totalCount,
  averageRating,
}: {
  totalCount: number;
  averageRating: number;
}) {
  const displayRating =
    averageRating > 0
      ? Number.isInteger(averageRating)
        ? String(averageRating)
        : averageRating.toFixed(1)
      : "0";
  const displayCount = totalCount.toLocaleString();

  return (
    <div
      className="section-card flex min-h-[200px] w-full max-w-full flex-col items-center justify-center gap-2 p-4 text-center sm:min-h-[220px] sm:max-w-[355px] sm:p-6 md:max-w-full"
      style={{
        backgroundColor: "#FFF",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        fontFamily: "var(--font-inter), Inter, sans-serif",
      }}
    >
      <div
        className="flex justify-center items-center gap-0.5"
        style={{ color: "#FFD700" }}
        aria-hidden
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="flex items-center justify-center"
            style={{ width: 24, height: 24, fontSize: "1.5rem", lineHeight: 1 }}
          >
            ★
          </span>
        ))}
      </div>
      <p
        className="font-medium"
        style={{
          color: "#1E1E1E",
          fontSize: "0.9375rem",
          fontWeight: 500,
          lineHeight: "normal",
        }}
      >
        Average Customer Ratings
      </p>
      <p
        className="font-bold"
        style={{
          color: "#1E1E1E",
          fontSize: "1.75rem",
          fontWeight: 700,
          lineHeight: "normal",
          fontStyle: "italic",
        }}
      >
        {displayRating}/5
      </p>
      <p
        style={{
          color: "#9CA3AF",
          fontSize: "0.875rem",
          fontWeight: 400,
          lineHeight: "normal",
        }}
      >
        {displayCount} customer review{totalCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}

const REVIEW_PREVIEW_LENGTH = 300;

function ReviewCard({
  r,
  reviewNumber,
  totalReviews,
  showFullText = false,
}: {
  r: ReviewItem;
  /** 1-based index for Q/A (e.g. 4 = "Review #4"). */
  reviewNumber?: number;
  totalReviews?: number;
  /** When true, always show full review (no 300-char trim / See more). */
  showFullText?: boolean;
}) {
  const text = r.text ?? "";
  const isLong = !showFullText && text.length > REVIEW_PREVIEW_LENGTH;
  const [expanded, setExpanded] = React.useState(false);
  const displayText = isLong && !expanded ? `${text.slice(0, REVIEW_PREVIEW_LENGTH).trim()}…` : text;

  return (
    <div
      className="section-card relative flex min-h-[200px] w-full max-w-full flex-col justify-center p-4 text-center sm:min-h-[220px] sm:max-w-[355px] sm:p-6 md:max-w-full"
      style={{ backgroundColor: "#FFF" }}
    >
      {reviewNumber != null && (
        <p
          className="mb-2 text-right sm:absolute sm:top-3 sm:right-3 sm:mb-0"
          style={{
            color: "#9CA3AF",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "0.75rem",
            fontWeight: 500,
            lineHeight: "normal",
          }}
        >
          Review #{reviewNumber}
          {totalReviews != null ? ` of ${totalReviews}` : ""}
        </p>
      )}
      {r.stars != null && (
        <div
          className="flex justify-center items-center gap-0.5"
          style={{ color: "#FFD700" }}
          aria-hidden
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="flex items-center justify-center"
              style={{
                width: 24,
                height: 24,
                fontSize: "1.5rem",
                lineHeight: 1,
              }}
            >
              {i < Math.min(5, r.stars ?? 0) ? "★" : "☆"}
            </span>
          ))}
        </div>
      )}
      <p
        className="mx-auto mt-4 min-h-0 max-w-full overflow-y-auto text-center break-words text-balance"
        style={{
          color: "#333333",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: "clamp(0.875rem, 2.8vw, 0.9375rem)",
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: 1.5,
        }}
      >
        {displayText}
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="ml-1 inline-block font-medium text-[#498CCB] hover:underline focus:outline-none focus:underline"
          >
            {expanded ? "See less" : "See more"}
          </button>
        )}
      </p>
      <p
        className="mt-4 font-semibold"
        style={{
          color: "#333333",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: "1rem",
          fontStyle: "normal",
          fontWeight: 600,
          lineHeight: "normal",
        }}
      >
        {r.name}
      </p>
      {r.date && (
        <p
          className="mt-1"
          style={{
            color: "#666666",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "0.75rem",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "normal",
          }}
        >
          {r.date}
        </p>
      )}
    </div>
  );
}

const AUTO_SCROLL_INTERVAL_MS = 5500;

export function ReviewsCarousel({
  reviews,
  reviewSummary = null,
  expandFirstReviewFullText = false,
}: {
  reviews: ReviewItem[];
  /** When provided (e.g. from Klaviyo), summary card shows these. When null, derived from reviews. */
  reviewSummary?: ReviewSummary | null;
  /** Product page: first visible review card shows full text (no truncation). */
  expandFirstReviewFullText?: boolean;
}) {
  const [index, setIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const L = Math.max(1, reviews.length);
  const current = reviews[index % L];
  const canPrev = reviews.length > 1 && index > 0;
  const canNext = reviews.length > 1 && index < reviews.length - 1;

  const summary: ReviewSummary = React.useMemo(() => {
    if (reviewSummary && (reviewSummary.totalCount > 0 || reviewSummary.averageRating > 0))
      return reviewSummary;
    const total = reviews.length;
    const withStars = reviews.filter((r) => r.stars != null && r.stars > 0);
    const avg =
      withStars.length > 0
        ? withStars.reduce((s, r) => s + (r.stars ?? 0), 0) / withStars.length
        : 0;
    return { totalCount: total, averageRating: Math.round(avg * 10) / 10 };
  }, [reviewSummary, reviews]);

  React.useEffect(() => {
    if (reviews.length <= 1 || isPaused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 3) % reviews.length);
    }, AUTO_SCROLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [reviews.length, isPaused]);

  const showSummary = summary.totalCount > 0 || summary.averageRating > 0;

  return (
    <div
      className="reviews-carousel-root w-full min-w-0 max-w-full overflow-x-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Mobile: summary card (if we have summary) then single review with arrows and dots */}
      <div className="mt-6 flex w-full min-w-0 flex-col items-stretch gap-5 sm:mt-10 sm:gap-6 md:hidden">
        {showSummary && (
          <div className="mx-auto w-full max-w-full">
            <ReviewSummaryCard
              totalCount={summary.totalCount}
              averageRating={summary.averageRating}
            />
          </div>
        )}
        <div className="flex w-full min-w-0 flex-col items-center justify-center gap-3">
          <div className="flex w-full min-w-0 items-stretch gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={!canPrev}
              className="flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center self-center rounded-full bg-transparent text-[#333333] disabled:pointer-events-none disabled:opacity-30 hover:opacity-80"
              aria-label="Previous review"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              {current ? (
                <ReviewCard
                  r={current}
                  reviewNumber={index + 1}
                  totalReviews={reviews.length}
                  showFullText={expandFirstReviewFullText}
                />
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(reviews.length - 1, i + 1))}
              disabled={!canNext}
              className="flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center self-center rounded-full bg-transparent text-[#333333] disabled:pointer-events-none disabled:opacity-30 hover:opacity-80"
              aria-label="Next review"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: 4 columns — column 1 = summary card (static), columns 2–4 = auto-scrolling review cards */}
      <div
        className={`mx-auto mt-10 hidden w-full min-w-0 max-w-6xl gap-4 md:grid md:justify-items-center md:gap-6 lg:gap-8 ${showSummary ? "md:grid-cols-4" : "md:grid-cols-3"}`}
      >
        {showSummary && (
          <div className="w-full max-w-[355px]">
            <ReviewSummaryCard
              totalCount={summary.totalCount}
              averageRating={summary.averageRating}
            />
          </div>
        )}
        {[0, 1, 2].map((offset) => {
          const i = (index + offset) % L;
          const r = reviews[i];
          return (
            <div key={offset} className="w-full max-w-[355px]">
              {r ? (
                <ReviewCard
                  r={r}
                  reviewNumber={i + 1}
                  totalReviews={reviews.length}
                  showFullText={expandFirstReviewFullText && offset === 0}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
