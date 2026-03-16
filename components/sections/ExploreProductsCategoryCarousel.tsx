"use client";

/**
 * Category carousel for Explore Products (Catch of the day) section.
 * Shows image + label per category with left/right arrows. Dark theme (white text, white arrows).
 * Uses the same CarouselArrow as the Product Carousel section.
 */
import Link from "next/link";
import * as React from "react";
import { CarouselArrow } from "@/components/ui/CarouselArrow";

export type ExploreCategoryItem = {
  label?: string;
  href: string;
  imageUrl: string | null;
  collectionHandle?: string;
};

const CARD_WIDTH = 331;
const GAP = 24;

export function ExploreProductsCategoryCarousel({
  categories,
  textTheme = "dark",
  labelColor,
}: {
  categories: ExploreCategoryItem[];
  /** "light" = dark text/arrows for light backgrounds; "dark" = white text/arrows. */
  textTheme?: "light" | "dark";
  /** Override label color (e.g. #1E1E1E for light backgrounds). */
  labelColor?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  const updateScrollState = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 1);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [categories.length, updateScrollState]);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (CARD_WIDTH + GAP), behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  const cardContent = (cat: ExploreCategoryItem, idx: number) => (
    <Link
      key={idx}
      href={cat.href}
      className="group flex flex-col items-center outline-none focus:outline-none w-full md:w-auto md:shrink-0 md:snap-start"
    >
      <div className="overflow-hidden rounded-lg w-full md:w-[331px] transition-all shrink-0 hover:shadow-md border-0 border-none shadow-none ring-0 bg-transparent">
        <div
          className="relative shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] rounded-[10px] group-hover:bg-white/15 border-0 border-none ring-0 w-full aspect-[4/3]"
          style={{ maxWidth: "100%" }}
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
          {(cat.collectionHandle === "pet-treats" || cat.label?.toLowerCase().includes("pet")) && (
            <img
              src="/pet%201.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute bottom-3 right-3 h-12 w-12 object-contain opacity-90 sm:h-14 sm:w-14"
            />
          )}
        </div>
        <div className="py-3 text-center">
          <span
            className="capitalize"
            style={{
              color: labelColor ?? "#FFF",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 20,
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "normal",
              textTransform: "capitalize",
            }}
          >
            {cat.label ?? "Shop"}
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="relative mx-auto w-full max-w-6xl mt-10 px-2">
      {/* Mobile: single column stack; md+: horizontal carousel */}
      <div
        ref={ref}
        className="flex flex-col gap-6 md:flex-row md:gap-6 md:overflow-x-auto md:scroll-smooth md:snap-x md:snap-mandatory py-4 md:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]"
      >
        {categories.map((cat, idx) => cardContent(cat, idx))}
      </div>

      <CarouselArrow
        direction="prev"
        disabled={!canScrollPrev}
        onClick={() => scroll(-1)}
        ariaLabel="Scroll left"
        theme={textTheme}
        arrowColor="#FFFFFF"
      />
      <CarouselArrow
        direction="next"
        disabled={!canScrollNext}
        onClick={() => scroll(1)}
        ariaLabel="Scroll right"
        theme={textTheme}
        arrowColor="#FFFFFF"
      />
    </div>
  );
}
