"use client";

/**
 * Category carousel for Explore Products (Catch of the day) section.
 * Shows image + label per category with left/right arrows. Dark theme (white text, white arrows).
 * Uses the same CarouselArrow as the Product Carousel section.
 */
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { CarouselArrow } from "@/components/ui/CarouselArrow";
import { safeHref } from "@/lib/urlValidation";

export type ExploreCategoryItem = {
  label?: string;
  href: string;
  imageUrl: string | null;
  collectionHandle?: string;
};

const CARD_WIDTH = 331;
const GAP = 24;
/** Visible viewport fits exactly 3 cards so only 3 columns show at a time. */
const VISIBLE_WIDTH = CARD_WIDTH * 3 + GAP * 2;

export function ExploreProductsCategoryCarousel({
  categories,
  textTheme = "dark",
  labelColor,
  arrowColor,
}: {
  categories: ExploreCategoryItem[];
  /** "light" = dark text/arrows for light backgrounds; "dark" = white text/arrows. */
  textTheme?: "light" | "dark";
  /** Override label color (e.g. #1E1E1E for light backgrounds). */
  labelColor?: string;
  /** Override arrow color (e.g. #1E1E1E on /calendar page). When set, overrides default white. */
  arrowColor?: string;
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
      href={safeHref(cat.href) || "/shop"}
      prefetch
      className="group flex flex-col items-center outline-none focus:outline-none w-full md:w-auto md:shrink-0 md:snap-start"
    >
      <div className="section-card overflow-hidden w-full md:w-[331px] transition-all duration-200 shrink-0 hover:scale-[1.02] active:scale-[0.98] active:opacity-95 border-0 border-none ring-0 bg-transparent">
        <div
          className="rounded-card relative shrink-0 overflow-hidden border-0 border-none ring-0 w-full aspect-[4/3]"
          style={{ maxWidth: "100%" }}
        >
          {cat.imageUrl && typeof cat.imageUrl === "string" ? (
            <Image
              src={cat.imageUrl}
              alt={cat.label ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 331px"
              priority={idx < 3}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
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
          {(cat.collectionHandle === "pet-treats" ||
            cat.label?.toLowerCase().includes("pet")) && (
            <Image
              src="/pet%201.png"
              alt=""
              aria-hidden
              width={56}
              height={56}
              className="pointer-events-none absolute bottom-3 right-3 h-12 w-12 object-contain opacity-90 sm:h-14 sm:w-14"
            />
          )}
        </div>
        <div
          className="rounded-card-b py-3 text-center"
          style={{ backgroundColor: "var(--section-bg)" }}
        >
          <span
            className="capitalize"
            style={{
              color: labelColor ?? "#FFF",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "1.25rem",
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

  const showCarouselViewport = categories.length > 3;
  return (
    <div className="relative mx-auto w-full max-w-6xl mt-10 px-6 md:px-2">
      {/* Mobile: single column stack; md+: horizontal carousel — viewport shows exactly 3 cards, centered */}
      <div className="w-full md:flex md:justify-center">
        <div
          ref={ref}
          className="flex flex-col gap-6 md:flex-row md:gap-6 md:overflow-x-auto md:scroll-smooth md:snap-x md:snap-mandatory py-4 md:justify-start [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]"
          style={
            showCarouselViewport
              ? {
                  width: "min(100%, " + VISIBLE_WIDTH + "px)",
                  minWidth: 0,
                  maxWidth: VISIBLE_WIDTH,
                }
              : undefined
          }
        >
          {categories.map((cat, idx) => cardContent(cat, idx))}
        </div>
      </div>

      <CarouselArrow
        direction="prev"
        disabled={!canScrollPrev}
        onClick={() => scroll(-1)}
        ariaLabel="Scroll left"
        theme={textTheme}
        arrowColor={arrowColor ?? "#FFFFFF"}
      />
      <CarouselArrow
        direction="next"
        disabled={!canScrollNext}
        onClick={() => scroll(1)}
        ariaLabel="Scroll right"
        theme={textTheme}
        arrowColor={arrowColor ?? "#FFFFFF"}
      />
    </div>
  );
}
