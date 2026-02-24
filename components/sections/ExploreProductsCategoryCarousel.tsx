"use client";

/**
 * Category carousel for Explore Products (Catch of the day) section.
 * Shows image + label per category with left/right arrows. Dark theme (white text, white arrows).
 */
import Link from "next/link";
import * as React from "react";

export type ExploreCategoryItem = {
  label?: string;
  href: string;
  imageUrl: string | null;
};

const CARD_WIDTH = 331;
const GAP = 24;

export function ExploreProductsCategoryCarousel({
  categories,
}: {
  categories: ExploreCategoryItem[];
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (CARD_WIDTH + GAP), behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <div className="relative mx-auto w-full max-w-6xl mt-10">
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 px-2 justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]"
      >
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="group shrink-0 snap-start flex flex-col items-center"
          >
            <div className="overflow-hidden rounded-lg bg-white/10 border border-white/20 w-[331px] max-w-full shadow-sm transition-all hover:border-white/40 hover:bg-white/15 shrink-0">
              <div
                className="relative shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] rounded-[10px]"
                style={{
                  width: "331px",
                  maxWidth: "100%",
                  aspectRatio: "4 / 3",
                }}
              >
                {cat.imageUrl && typeof cat.imageUrl === "string" ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.label ?? ""}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
                    <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="py-3 text-center">
                <span className="text-sm font-medium text-white tracking-wide">
                  {cat.label ?? "Shop"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 hidden h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/10 text-white hover:bg-white/20 md:flex"
        aria-label="Scroll left"
      >
        <span className="text-xl leading-none">‹</span>
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 hidden h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/10 text-white hover:bg-white/20 md:flex"
        aria-label="Scroll right"
      >
        <span className="text-xl leading-none">›</span>
      </button>
    </div>
  );
}
