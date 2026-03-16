"use client";

/**
 * Grid for the Product Carousel section only.
 * Card sizes and layout here do not affect the first "Catch of the day" (Explore Products) section.
 */
import * as React from "react";
import {
  CatchOfTheDayProductCard,
  type CatchOfTheDayProductCardProduct,
} from "@/app/components/CatchOfTheDayProductCard";
import { CarouselArrow } from "@/components/ui/CarouselArrow";
import type { ApiProductForCarousel, FilterItem } from "@/lib/types";

const ITEMS_PER_PAGE = 3;
const MAX_PRODUCTS = 9;

function mapApiProductToCard(
  p: ApiProductForCarousel,
): CatchOfTheDayProductCardProduct {
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

function matchesProductTypeFilter(
  productType: string | null | undefined,
  selectedValues: string[],
  commaSeparated: boolean
): boolean {
  if (selectedValues.length === 0) return true;
  if (!productType || typeof productType !== "string") return false;
  const values = commaSeparated
    ? productType.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [productType.trim().toLowerCase()];
  const selected = selectedValues.map((v) => v.trim().toLowerCase());
  return values.some((v) => selected.includes(v));
}

export function CatchOfTheDayGrid({
  filterCollections,
  initialProducts = [],
  selectedProductTypeFilter = [],
  hideCollectionTabs = false,
  matchProductTypesAsCommaSeparated = false,
  darkSection = false,
}: {
  filterCollections: FilterItem[];
  /** Pre-fetched products for the first collection (avoids "Loading products…" on hard refresh). */
  initialProducts?: ApiProductForCarousel[];
  /** When set, only products whose productType matches one of these values are shown (e.g. on /shop page). */
  selectedProductTypeFilter?: string[];
  /** When true, hide the Seafood / Subscription Box / etc. tabs and only show the first collection (e.g. on /shop page). */
  hideCollectionTabs?: boolean;
  /** When true (shop page only), product type / filterValue is treated as comma-separated (e.g. "Boxes, Salmon, Sablefish"). */
  matchProductTypesAsCommaSeparated?: boolean;
  /** When true, section has dark/navy background; card footers use a light background for readable text. */
  darkSection?: boolean;
}) {
  const collections = filterCollections ?? [];
  const effectiveCollections = hideCollectionTabs && collections.length > 0
    ? [collections[0]]
    : collections;
  const firstHandle = collections[0]?.collectionHandle?.trim() ?? "";
  const initialMapped = React.useMemo(
    () => (initialProducts.length > 0 ? initialProducts.map(mapApiProductToCard) : []),
    [initialProducts],
  );

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [products, setProducts] = React.useState<
    CatchOfTheDayProductCardProduct[]
  >(initialMapped);
  const [loading, setLoading] = React.useState(initialMapped.length === 0);
  const [error, setError] = React.useState<string | null>(null);
  const cacheRef = React.useRef<Map<string, CatchOfTheDayProductCardProduct[]>>(
    new Map(),
  );
  const rawProductsRef = React.useRef<Map<string, ApiProductForCarousel[]>>(new Map());

  if (firstHandle && initialMapped.length > 0 && !cacheRef.current.has(firstHandle)) {
    cacheRef.current.set(firstHandle, initialMapped);
    if (initialProducts.length > 0) rawProductsRef.current.set(firstHandle, initialProducts);
  }

  const currentCollection = effectiveCollections[activeIndex];
  const collectionHandle = currentCollection?.collectionHandle?.trim() ?? "";

  React.useEffect(() => {
    setActiveIndex((prev) =>
      Math.min(prev, Math.max(0, effectiveCollections.length - 1)),
    );
  }, [effectiveCollections.length]);

  React.useEffect(() => {
    const cached = cacheRef.current.get(collectionHandle);
    if (cached !== undefined) {
      setProducts(cached);
      setPageIndex(0);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setProducts([]);
    setPageIndex(0);
    setLoading(true);
    setError(null);
    const url = collectionHandle
      ? `/api/collections/${encodeURIComponent(collectionHandle)}/products`
      : `/api/products?first=${MAX_PRODUCTS}`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json: { products?: ApiProductForCarousel[] }) => {
        const raw = json.products ?? [];
        const mapped = raw.map(mapApiProductToCard);
        if (!controller.signal.aborted) {
          rawProductsRef.current.set(collectionHandle, raw);
          cacheRef.current.set(collectionHandle, mapped);
          setProducts(mapped);
          setPageIndex(0);
          setError(null);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setProducts([]);
          setError("Couldn't load products. Try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [collectionHandle]);

  const displayProducts = React.useMemo(() => {
    if (selectedProductTypeFilter.length === 0) return products;
    const raw = rawProductsRef.current.get(collectionHandle);
    if (!raw?.length) return products;
    const filtered = raw
      .filter((p) =>
        matchesProductTypeFilter(
          p.filterValue ?? p.productType,
          selectedProductTypeFilter,
          matchProductTypesAsCommaSeparated
        )
      )
      .map(mapApiProductToCard);
    return filtered;
  }, [products, collectionHandle, selectedProductTypeFilter]);

  React.useEffect(() => {
    setPageIndex(0);
  }, [selectedProductTypeFilter]);

  const pageCount = Math.max(1, Math.ceil(displayProducts.length / ITEMS_PER_PAGE));
  const currentPageProducts = displayProducts.slice(
    pageIndex * ITEMS_PER_PAGE,
    pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
  );
  const canGoPrev = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;

  const goToPage = (dir: -1 | 1) => {
    setPageIndex((prev) => Math.max(0, Math.min(pageCount - 1, prev + dir)));
  };

  return (
    <>
      {/* Collection tabs (Seafood, Subscription Box, etc.) – hidden on shop page when hideCollectionTabs */}
      {!hideCollectionTabs && collections.length > 0 && (
        <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 px-6 md:px-4">
          {collections.map((col, idx) => (
            <button
              key={col.collectionHandle ?? col.label ?? `filter-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`product-carousel-filter inline-flex items-center justify-center transition-colors whitespace-nowrap px-6 ${idx === activeIndex ? "product-carousel-filter--active" : ""}`}
            >
              {col.label ?? "Shop"}
            </button>
          ))}
        </div>
      )}

      {/* Product carousel - 3 centered columns */}
      <div className="relative mt-4 sm:mt-6 lg:mt-8 px-6 md:px-2">
        <div className="mx-auto w-full max-w-[1200px]">
          {loading && products.length === 0 ? (
            <div className="relative flex items-center justify-center gap-6">
              <CarouselArrow direction="prev" disabled onClick={() => {}} ariaLabel="Previous" />
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-[1200px] mx-auto place-items-center"
                style={{ gap: "6px" }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-[387px] max-w-full flex flex-col rounded-xl overflow-hidden animate-pulse"
                  >
                    <div
                      className="w-full shrink-0 bg-white/10"
                      style={{ height: 320, borderRadius: 10 }}
                    />
                    <div
                      className="flex flex-1 flex-col px-4 py-3 gap-2"
                      style={{ backgroundColor: "var(--brand-navy)" }}
                    >
                      <div className="h-5 w-3/4 rounded bg-white/10" />
                      <div className="h-4 w-1/2 rounded bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
              <CarouselArrow direction="next" disabled onClick={() => {}} ariaLabel="Next" />
            </div>
          ) : error ? (
            <div
              className="flex min-h-[400px] items-center justify-center py-24 px-4 text-center"
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                color: "#F2F6EF",
                fontSize: "16px",
              }}
            >
              {error}
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="relative flex items-center justify-center gap-6">
              <CarouselArrow
                direction="prev"
                disabled={!canGoPrev}
                onClick={() => goToPage(-1)}
                ariaLabel="Previous"
              />
              {/* 3 centered columns - card dimensions match Recipe cards (min 280px, max 387px) */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-[1200px] mx-auto place-items-center"
                style={{ gap: "6px" }}
              >
                {currentPageProducts.map((product) => (
                  <div key={product.id} className="min-w-0 w-[387px] max-w-full">
                    <CatchOfTheDayProductCard product={product} darkSection={darkSection} />
                  </div>
                ))}
              </div>
              <CarouselArrow
                direction="next"
                disabled={!canGoNext}
                onClick={() => goToPage(1)}
                ariaLabel="Next"
              />
            </div>
          ) : (
            <p
              className="py-12 text-center text-white"
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "16px",
              }}
            >
              {selectedProductTypeFilter.length > 0
                ? "No products match the current filter."
                : "No products in this collection. Add products in Shopify and assign them to the collection."}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
