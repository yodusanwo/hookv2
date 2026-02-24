"use client";

import * as React from "react";
import Link from "next/link";
import { safeHref } from "@/lib/urlValidation";
import {
  CatchOfTheDayProductCard,
  type CatchOfTheDayProductCardProduct,
} from "@/app/components/CatchOfTheDayProductCard";

type FilterItem = { label?: string; collectionHandle?: string };

type ApiProduct = {
  id: string;
  title: string;
  handle: string;
  images?: { edges?: Array<{ node?: { url?: string; altText?: string | null } }> };
  price?: string;
  currencyCode?: string;
  priceRange?: { minVariantPrice?: { amount?: string; currencyCode?: string } };
  variantId?: string | null;
  compareAtPrice?: string | null;
  availableForSale?: boolean;
  sizeOrDescription?: string | null;
};

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

  const collections = React.useMemo(
    () =>
      (filterCollections ?? []).filter((f) => f.label || f.collectionHandle),
    [filterCollections]
  );

  const currentCollection = collections[activeIndex];
  const collectionHandle = currentCollection?.collectionHandle?.trim() ?? "";

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const url = collectionHandle
      ? `/api/collections/${encodeURIComponent(collectionHandle)}/products`
      : "/api/products?first=9";

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json: { products?: ApiProduct[] }) => {
        const raw = json.products ?? [];
        const mapped: CatchOfTheDayProductCardProduct[] = raw.map((p) => {
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
        });
        if (!controller.signal.aborted) {
          setProducts(mapped);
          setPageIndex(0);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setProducts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [collectionHandle]);

  const visibleProducts = products.slice(0, 9);
  const pageCount = Math.max(1, Math.ceil(visibleProducts.length / 3));
  const currentPageProducts = visibleProducts.slice(pageIndex * 3, pageIndex * 3 + 3);
  const canGoPrev = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;

  const goToPage = (dir: -1 | 1) => {
    setPageIndex((prev) => Math.max(0, Math.min(pageCount - 1, prev + dir)));
  };

  return (
    <>
      {/* Filter buttons */}
      {collections.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-3 px-4">
          {collections.map((col, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                idx === activeIndex
                  ? "bg-slate-600 text-white"
                  : "border border-white/60 bg-transparent text-white hover:border-white hover:bg-white/10"
              }`}
              style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
            >
              {col.label ?? "Shop"}
            </button>
          ))}
        </div>
      )}

      {/* Product carousel - 3 centered columns */}
      <div className="relative mt-10 mx-4">
        <div className="mx-auto w-full max-w-[1200px] px-4">
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
          ) : products.length > 0 ? (
            <div className="relative flex items-center justify-center gap-6">
              {/* Prev arrow */}
              <button
                type="button"
                onClick={() => goToPage(-1)}
                disabled={!canGoPrev}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none md:flex"
                aria-label="Previous"
              >
                <span className="text-xl leading-none">‹</span>
              </button>

              {/* 3 centered columns - card dimensions match Recipe cards (min 280px, max 387px) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[13px] w-full max-w-[1200px] mx-auto place-items-center">
                {currentPageProducts.map((product) => (
                  <div key={product.id} className="w-full min-w-[280px] max-w-[387px]">
                    <CatchOfTheDayProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Next arrow */}
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={!canGoNext}
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none md:flex"
                aria-label="Next"
              >
                <span className="text-xl leading-none">›</span>
              </button>
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
