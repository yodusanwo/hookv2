"use client";

import * as React from "react";

type CarouselItem = {
  src: string;
  alt: string;
};

export function Carousel({
  items,
  ariaLabel,
}: {
  items: CarouselItem[];
  ariaLabel: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  function scrollByDir(dir: -1 | 1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(520, el.clientWidth), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        aria-label={ariaLabel}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [-webkit-overflow-scrolling:touch]"
      >
        {items.map((item, idx) => (
          <div
            key={`${item.src}-${idx}`}
            className="snap-start shrink-0 w-[240px] h-[140px] overflow-hidden rounded-card bg-slate-200"
          >
            <img
              src={item.src}
              alt={item.alt}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByDir(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow ring-1 ring-black/10 hover:bg-white"
        aria-label="Scroll left"
      >
        <span aria-hidden>‹</span>
      </button>
      <button
        type="button"
        onClick={() => scrollByDir(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow ring-1 ring-black/10 hover:bg-white"
        aria-label="Scroll right"
      >
        <span aria-hidden>›</span>
      </button>
    </div>
  );
}

