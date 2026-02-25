"use client";

/**
 * Grid for the Product Carousel section only.
 * Card sizes and layout here do not affect the first "Catch of the day" (Explore Products) section.
 */
import * as React from "react";
import Link from "next/link";
import { safeHref } from "@/lib/urlValidation";
import {
  CatchOfTheDayProductCard,
  type CatchOfTheDayProductCardProduct,
} from "@/app/components/CatchOfTheDayProductCard";
import { CarouselArrow } from "@/components/ui/CarouselArrow";
import type { ApiProductForCarousel, FilterItem } from "@/lib/types";

const ITEMS_PER_PAGE = 3;
const MAX_PRODUCTS = 9;

function mapApiProductToCard(p: ApiProductForCarousel): CatchOfTheDayProductCardProduct {
  const img = p.images?.edges?.[0]?.node;
  const price = p.price ?? p.priceRange?.minVariantPrice?.amount ?? "0";
  const currencyCode = p.currencyCode ?? p.priceRange?.minVariantPrice?.currencyCode ?? "USD";
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

export function CatchOfTheDayGrid({
  filterCollections,
  cta,
}: {
  filterCollections: FilterItem[];
  cta?: { label?: string; href?: string };
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [products, setProducts] = React.useState<CatchOfTheDayProductCardProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const cacheRef = React.useRef<Map<string, CatchOfTheDayProductCardProduct[]>>(new Map());

  const collections = filterCollections ?? [];

  const currentCollection = collections[activeIndex];
  const collectionHandle = currentCollection?.collectionHandle?.trim() ?? "";

  React.useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(0, collections.length - 1)));
  }, [collections.length]);

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

  const pageCount = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  const currentPageProducts = products.slice(
    pageIndex * ITEMS_PER_PAGE,
    pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );
  const canGoPrev = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;

  const goToPage = (dir: -1 | 1) => {
    setPageIndex((prev) =>
      Math.max(0, Math.min(pageCount - 1, prev + dir))
    );
  };

  return (
    <>
      {/* Filter buttons */}
      {collections.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-3 px-4">
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
      <div className="relative mt-10">
        <div className="mx-auto w-full max-w-[1200px]">
          {loading ? (
            <div
              className="flex min-h-[400px] items-center justify-center py-24"
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                color: "#F2F6EF",
              }}
            >
              Loading products…
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
          ) : products.length > 0 ? (
            <div className="relative flex items-center justify-center gap-6">
              <CarouselArrow
                direction="prev"
                disabled={!canGoPrev}
                onClick={() => goToPage(-1)}
                ariaLabel="Previous"
              />
              {/* 3 centered columns - card dimensions match Recipe cards (min 280px, max 387px) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-[1200px] mx-auto place-items-center" style={{ gap: "6px" }}>
                {currentPageProducts.map((product) => (
                  <div key={product.id} className="w-[387px] max-w-full">
                    <CatchOfTheDayProductCard product={product} />
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
              No products in this collection. Add products in Shopify and
              assign them to the collection.
            </p>
          )}
        </div>
      </div>

      {/* CTA */}
      {cta && (
        <div className="mx-auto mt-12 flex max-w-6xl justify-center px-4">
          <Link href={safeHref(cta?.href) || "#shop"} className="btn-primary">
            {cta?.label ?? "SHOP FULL LINEUP →"}
          </Link>
        </div>
      )}
    </>
  );
}
