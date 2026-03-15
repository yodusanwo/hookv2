"use client";

import * as React from "react";
import {
  CatchOfTheDayProductCard,
  type CatchOfTheDayProductCardProduct,
} from "@/app/components/CatchOfTheDayProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CarouselArrow } from "@/components/ui/CarouselArrow";
import type { ApiProductForCarousel } from "@/lib/types";

const LIGHT_BG = "var(--brand-light-blue-bg)";
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

export function CategorySectionBlock({
  block,
  selectedFilterValues = [],
}: {
  block: CategorySectionBlockData;
  selectedFilterValues?: string[];
}) {
  const { title, description, collectionHandle, layout = "grid", blendWhiteWithBackground = false } = block;
  const [products, setProducts] = React.useState<ApiProductForCarousel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [carouselPage, setCarouselPage] = React.useState(0);

  React.useEffect(() => {
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
  }, [collectionHandle, layout]);

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
        className="relative z-20 overflow-visible py-8 sm:py-10 lg:py-12"
        style={{ backgroundColor: LIGHT_BG }}
      >
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <SectionHeading
            title={title}
            variant="display"
            theme="light"
            titleColor="#1E1E1E"
          />
          {description && (
            <p
              className="mx-auto w-full max-w-[933px] text-center mt-4"
              style={{
                color: "var(--Text-Color, #1E1E1E)",
                fontFamily: "Inter, var(--font-inter), sans-serif",
                fontSize: "20px",
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
              className="grid gap-6 mt-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              style={{ minHeight: 320 }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full max-w-[387px] mx-auto rounded-xl overflow-hidden animate-pulse"
                >
                  <div
                    className="w-full bg-white/30"
                    style={{ height: 320, borderRadius: 10 }}
                  />
                  <div className="h-20 bg-white/20 rounded-b-xl" />
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
              />
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-6 place-items-center"
                style={{ gap: "24px" }}
              >
                {carouselSlice.map((product) => (
                  <div key={product.id} className="w-[387px] max-w-full">
                    <CatchOfTheDayProductCard product={product} blendWhiteWithSectionBackground={blendWhiteWithBackground} />
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
              />
            </div>
            )
          ) : (
            <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {cards.length === 0 ? (
                <p className="col-span-full text-center text-slate-600 py-12">
                  No products match the current filter.
                </p>
              ) : (
                cards.map((product) => (
                  <div key={product.id} className="w-full max-w-[387px] mx-auto">
                    <CatchOfTheDayProductCard product={product} blendWhiteWithSectionBackground={blendWhiteWithBackground} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
    </section>
  );
}
