"use client";

import Link from "next/link";
import * as React from "react";

export type CategoryItem = {
  label?: string;
  href: string;
  imageUrl: string | null;
};

export function ExploreProductsCarousel({
  categories,
}: {
  categories: CategoryItem[];
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const cardWidth = 220;
    el.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <div className="relative mx-auto max-w-6xl px-6 md:px-4">
      <div
        ref={ref}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="group shrink-0 snap-start w-[200px] sm:w-[220px] overflow-hidden transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="aspect-square bg-slate-100">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.label ?? ""}
                    className="h-full w-full max-w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <svg
                      className="h-16 w-16"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4 text-center">
                <span className="text-sm font-medium uppercase tracking-wide text-slate-700 group-hover:text-slate-900">
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
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2 hidden h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-sm hover:bg-white hover:text-slate-800 md:inline-flex"
        aria-label="Scroll left"
      >
        <span className="text-xl leading-none">‹</span>
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 hidden h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-sm hover:bg-white hover:text-slate-800 md:inline-flex"
        aria-label="Scroll right"
      >
        <span className="text-xl leading-none">›</span>
      </button>
    </div>
  );
}
