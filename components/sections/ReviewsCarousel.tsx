"use client";

import * as React from "react";

export type ReviewItem = {
  stars?: number;
  text?: string;
  name?: string;
  date?: string;
};

function ReviewCard({ r }: { r: ReviewItem }) {
  return (
    <div
      className="flex w-full max-w-[355px] flex-col justify-center rounded-[12px] bg-white p-6 text-center shadow-sm md:max-w-full"
      style={{ minHeight: 220 }}
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
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              {i < Math.min(5, r.stars ?? 0) ? "★" : "☆"}
            </span>
          ))}
        </div>
      )}
      <p
        className="mt-4 min-h-0 overflow-y-auto mx-auto text-center"
        style={{
          maxWidth: "100%",
          color: "#333333",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: 15,
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: 1.5,
        }}
      >
        {r.text}
      </p>
      <p
        className="mt-4 font-semibold"
        style={{
          color: "#333333",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: 16,
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
  );
}

export function ReviewsCarousel({ reviews }: { reviews: ReviewItem[] }) {
  const [index, setIndex] = React.useState(0);
  const current = reviews[index % Math.max(1, reviews.length)];
  const canPrev = reviews.length > 1 && index > 0;
  const canNext = reviews.length > 1 && index < reviews.length - 1;

  return (
    <>
      {/* Mobile: single card with arrows */}
      <div className="relative mt-10 flex md:hidden items-center justify-center gap-2 px-4">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={!canPrev}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-transparent text-[#333333] disabled:opacity-30 disabled:pointer-events-none hover:opacity-80"
          aria-label="Previous review"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="min-w-0 flex-1 px-10">
          {current ? <ReviewCard r={current} /> : null}
        </div>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(reviews.length - 1, i + 1))}
          disabled={!canNext}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-transparent text-[#333333] disabled:opacity-30 disabled:pointer-events-none hover:opacity-80"
          aria-label="Next review"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Desktop: three columns in one row */}
      <div className="mt-10 hidden max-w-6xl mx-auto gap-6 px-4 md:grid md:grid-cols-3 md:justify-items-center">
        {reviews.map((r, idx) => (
          <div key={idx} className="w-full max-w-[355px]">
            <ReviewCard r={r} />
          </div>
        ))}
      </div>
    </>
  );
}
