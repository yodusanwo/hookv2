"use client";

import * as React from "react";

export type ReviewItem = {
  stars?: number;
  text?: string;
  name?: string;
  date?: string;
};

/** @deprecated Summary card removed; kept for optional callers — ignored. */
export type ReviewSummary = { totalCount: number; averageRating: number };

const REVIEW_PREVIEW_LENGTH = 300;

function ReviewCard({
  r,
  showFullText = false,
}: {
  r: ReviewItem;
  /** When true, always show full review (no 300-char trim / See more). */
  showFullText?: boolean;
}) {
  const text = r.text ?? "";
  const isLong = !showFullText && text.length > REVIEW_PREVIEW_LENGTH;
  const [expanded, setExpanded] = React.useState(false);
  const displayText =
    isLong && !expanded
      ? `${text.slice(0, REVIEW_PREVIEW_LENGTH).trim()}…`
      : text;

  return (
    <div
      className="section-card relative flex min-h-[200px] w-full max-w-full flex-col justify-center p-4 text-center sm:min-h-[220px] sm:max-w-[355px] sm:p-6 md:max-w-full"
      style={{ backgroundColor: "#FFF" }}
    >
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
  reviewSummary: _reviewSummary = null,
  expandFirstReviewFullText = false,
}: {
  reviews: ReviewItem[];
  /** Ignored — average-rating summary card removed site-wide. */
  reviewSummary?: ReviewSummary | null;
  /** Product page: first visible review card shows full text (no truncation). */
  expandFirstReviewFullText?: boolean;
}) {
  const [index, setIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const L = Math.max(1, reviews.length);
  /** How many cards to show in the desktop row — never more than we have, or we repeat the same review (e.g. 1 review × 3 columns). */
  const desktopSlotCount = Math.min(3, reviews.length);
  const current = reviews[index % L];
  const canPrev = reviews.length > 1 && index > 0;
  const canNext = reviews.length > 1 && index < reviews.length - 1;

  React.useEffect(() => {
    if (reviews.length <= 1 || isPaused) return;
    const id = setInterval(() => {
      /** +1 rotates the desktop window by one review. +3 matched a 3-card “page” step but (i+3)%L === i when L divides 3 (e.g. L=3), freezing the carousel. */
      setIndex((i) => (i + 1) % reviews.length);
    }, AUTO_SCROLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [reviews.length, isPaused]);

  return (
    <div
      className="reviews-carousel-root w-full min-w-0 max-w-full overflow-x-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Mobile: single review with arrows */}
      <div className="mt-6 flex w-full min-w-0 flex-col items-stretch gap-5 sm:mt-10 sm:gap-6 md:hidden">
        <div className="flex w-full min-w-0 flex-col items-center justify-center gap-3">
          <div className="flex w-full min-w-0 items-stretch gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={!canPrev}
              className="flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center self-center rounded-full bg-transparent text-[#333333] disabled:pointer-events-none disabled:opacity-30 hover:opacity-80"
              aria-label="Previous review"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              {current ? (
                <ReviewCard
                  r={current}
                  showFullText={expandFirstReviewFullText}
                />
              ) : null}
            </div>
            <button
              type="button"
              onClick={() =>
                setIndex((i) => Math.min(reviews.length - 1, i + 1))
              }
              disabled={!canNext}
              className="flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center self-center rounded-full bg-transparent text-[#333333] disabled:pointer-events-none disabled:opacity-30 hover:opacity-80"
              aria-label="Next review"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: up to 3 auto-scrolling cards — only as many as we have reviews (no duplicate columns). */}
      <div
        className={`mx-auto mt-10 hidden w-full min-w-0 max-w-6xl gap-4 md:grid md:justify-items-center md:gap-6 lg:gap-8 ${
          desktopSlotCount === 1
            ? "md:grid-cols-1 md:max-w-[355px]"
            : desktopSlotCount === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-3"
        }`}
      >
        {Array.from({ length: desktopSlotCount }).map((_, offset) => {
          const i = (index + offset) % L;
          const r = reviews[i];
          return (
            <div key={offset} className="w-full max-w-[355px]">
              {r ? (
                <ReviewCard
                  r={r}
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
