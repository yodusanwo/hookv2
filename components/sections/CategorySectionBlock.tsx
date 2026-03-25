"use client";

import * as React from "react";
import {
  CatchOfTheDayProductCard,
  type CatchOfTheDayProductCardProduct,
} from "@/app/components/CatchOfTheDayProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CarouselArrow } from "@/components/ui/CarouselArrow";
import {
  type ApiProductForCarousel,
  carouselProductRowKey,
} from "@/lib/types";

const LIGHT_BG = "var(--brand-light-blue-bg)";
/** Explicit light blue so section and cards always match on /shop (e.g. gift card category). */
const LIGHT_BG_HEX = "#d4f2ff";
const GRID_FIRST = 50;
const CAROUSEL_FIRST = 24;
const CAROUSEL_PAGE_SIZE = 3;

function mapApiToCard(p: ApiProductForCarousel): CatchOfTheDayProductCardProduct {
  const img = p.images?.edges?.[0]?.node;
  const price = p.price ?? p.priceRange?.minVariantPrice?.amount ?? "0";
  const currencyCode =
    p.currencyCode ?? p.priceRange?.minVariantPrice?.currencyCode ?? "USD";
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    imageUrl: img?.url ?? null,
    price,
    currencyCode,
    compareAtPrice: p.compareAtPrice ?? null,
    variantId: p.variantId ?? null,
    availableForSale: p.availableForSale ?? false,
    sizeOrDescription: p.sizeOrDescription ?? null,
    requiresSellingPlan: p.requiresSellingPlan,
    ...(p.sellingPlans?.length ? { sellingPlans: p.sellingPlans } : {}),
  };
}

function matchesFilter(productType: string | null | undefined, selectedValues: string[]): boolean {
  if (selectedValues.length === 0) return true;
  if (!productType || typeof productType !== "string") return false;
  const values = productType
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const selected = selectedValues.map((v) => v.trim().toLowerCase());
  return values.some((v) => selected.includes(v));
}

export type CategorySectionBlockData = {
  title: string;
  description?: string | null;
  collectionHandle: string;
  layout?: "grid" | "carousel";
  blendWhiteWithBackground?: boolean;
};

/** Extra top padding when a wave divider is rendered above this section (so the wave isn't covered). */
const WAVE_CLEARANCE_PADDING = "clamp(8rem, 16vw, 12rem)";

export function CategorySectionBlock({
  block,
  selectedFilterValues = [],
  hasWaveAbove = false,
  initialProducts,
}: {
  block: CategorySectionBlockData;
  selectedFilterValues?: string[];
  /** When true, adds top padding so the wave above isn't covered by this section's background. */
  hasWaveAbove?: boolean;
  /** When set (e.g. from /shop server prefetch), skip client fetch and initial loading skeleton. */
  initialProducts?: ApiProductForCarousel[];
}) {
  const { title, description, collectionHandle, layout = "grid", blendWhiteWithBackground = false } = block;
  const hasServerProducts = initialProducts !== undefined;
  const [products, setProducts] = React.useState<ApiProductForCarousel[]>(
    () => initialProducts ?? [],
  );
  const [loading, setLoading] = React.useState(() => !hasServerProducts);
  const [error, setError] = React.useState<string | null>(null);
  const [carouselPage, setCarouselPage] = React.useState(0);

  React.useEffect(() => {
    if (hasServerProducts) return;
    const first = layout === "carousel" ? CAROUSEL_FIRST : GRID_FIRST;
    const url = `/api/collections/${encodeURIComponent(collectionHandle)}/products?first=${first}`;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json: { products?: ApiProductForCarousel[] }) => {
        if (!controller.signal.aborted) {
          setProducts(json.products ?? []);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Could not load products.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [collectionHandle, layout, hasServerProducts]);

  const filtered = React.useMemo(
    () =>
      products.filter((p) =>
        matchesFilter(p.filterValue ?? p.productType, selectedFilterValues)
      ),
    [products, selectedFilterValues]
  );
  const cards = filtered.map(mapApiToCard);

  React.useEffect(() => {
    setCarouselPage(0);
  }, [selectedFilterValues]);

  const carouselPageCount = Math.max(1, Math.ceil(cards.length / CAROUSEL_PAGE_SIZE));
  const carouselSlice = cards.slice(
    carouselPage * CAROUSEL_PAGE_SIZE,
    carouselPage * CAROUSEL_PAGE_SIZE + CAROUSEL_PAGE_SIZE
  );

  // Hide section when a product-type filter is active and no products match
  if (selectedFilterValues.length > 0 && !loading && cards.length === 0) {
    return null;
  }

  return (
    <section
        id={collectionHandle ? `shop-section-${collectionHandle}` : undefined}
        className="relative z-20 overflow-visible py-12 sm:py-10 lg:py-12"
        style={{
          backgroundColor: LIGHT_BG_HEX,
          ["--section-bg" as string]: LIGHT_BG_HEX,
          ...(hasWaveAbove ? { paddingTop: WAVE_CLEARANCE_PADDING } : {}),
        }}
      >
        <div className="mx-auto w-full max-w-[1200px] px-6 md:px-4">
          <SectionHeading
            title={title}
            variant="display"
            theme="light"
            titleColor="#1E1E1E"
          />
          {description && (
            <p
              className="mx-auto w-full max-w-[770px] text-center mt-4"
              style={{
                color: "#1E1E1E",
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "1rem",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "150%",
              }}
            >
              {description}
            </p>
          )}
          {loading ? (
            <div
              className="grid gap-6 mt-8 grid-cols-1 lg:grid-cols-3"
              style={{ minHeight: 320 }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full max-w-[387px] mx-auto overflow-hidden animate-pulse"
                >
                  <div
                    className="w-full bg-white/30"
                    style={{ height: 320 }}
                  />
                  <div className="h-20 bg-white/20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="mt-8 text-center text-slate-600">Could not load products.</p>
          ) : layout === "carousel" ? (
            cards.length === 0 ? (
              <p className="mt-8 text-center text-slate-600 py-12">
                No products match the current filter.
              </p>
            ) : (
            <div className="relative mt-8 flex items-center justify-center gap-4">
              <CarouselArrow
                direction="prev"
                disabled={carouselPageCount <= 1 || carouselPage <= 0}
                onClick={() => setCarouselPage((p) => Math.max(0, p - 1))}
                ariaLabel="Previous"
                theme="light"
              />
              <div
                className="grid grid-cols-1 lg:grid-cols-3 w-full gap-6 place-items-center"
                style={{ gap: "24px" }}
              >
                {carouselSlice.map((product, index) => (
                  <div
                    key={carouselProductRowKey(product)}
                    className="min-w-0 w-[387px] max-w-full"
                  >
                    <CatchOfTheDayProductCard product={product} blendWhiteWithSectionBackground={blendWhiteWithBackground} priority={index === 0} sectionBackgroundColor={LIGHT_BG_HEX} />
                  </div>
                ))}
              </div>
              <CarouselArrow
                direction="next"
                disabled={carouselPageCount <= 1 || carouselPage >= carouselPageCount - 1}
                onClick={() =>
                  setCarouselPage((p) => Math.min(carouselPageCount - 1, p + 1))
                }
                ariaLabel="Next"
                theme="light"
              />
            </div>
            )
          ) : (
            <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-3">
              {cards.length === 0 ? (
                <p className="col-span-full text-center text-slate-600 py-12">
                  No products match the current filter.
                </p>
              ) : (
                cards.map((product, index) => (
                  <div
                    key={carouselProductRowKey(product)}
                    className="w-full max-w-[387px] mx-auto"
                  >
                    <CatchOfTheDayProductCard product={product} blendWhiteWithSectionBackground={blendWhiteWithBackground} priority={index === 0} sectionBackgroundColor={LIGHT_BG_HEX} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
    </section>
  );
}
