"use client";

import * as React from "react";
import Link from "next/link";
import { safeHref } from "@/lib/urlValidation";
import { ExploreProductCard, type ExploreProductCardProduct } from "@/app/components/ExploreProductCard";

type FilterItem = { label?: string; collectionHandle?: string };

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function ExploreProductsGrid({
  filterCollections,
  cta,
}: {
  filterCollections: FilterItem[];
  cta?: { label?: string; href?: string };
}) {
  const [products, setProducts] = React.useState<ExploreProductCardProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Use first collection or all products (no category filters in this section)
  const collectionHandle = React.useMemo(
    () => filterCollections[0]?.collectionHandle?.trim() ?? "",
    [filterCollections]
  );

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
      .then((json: { products?: Array<{
        id: string;
        title: string;
        handle: string;
        priceRange?: { minVariantPrice?: { amount?: string; currencyCode?: string } };
        images?: { edges?: Array<{ node?: { url?: string; altText?: string | null } }> };
      }> }) => {
        const raw = json.products ?? [];
        const mapped: ExploreProductCardProduct[] = raw.map((p) => {
          const img = p.images?.edges?.[0]?.node;
          const price = p.priceRange?.minVariantPrice;
          return {
            id: p.id,
            handle: p.handle,
            title: p.title,
            imageUrl: img?.url ?? null,
            price: price?.amount ?? "0",
            currencyCode: price?.currencyCode ?? "USD",
            rating: 5,
          };
        });
        if (!controller.signal.aborted) setProducts(mapped);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setProducts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [collectionHandle]);

  const scrollByDir = React.useCallback((dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.min(400, el.clientWidth * 0.8);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  return (
    <>
      <div className="relative mx-auto mt-10 w-full max-w-[1363px]">
        <button
          type="button"
          onClick={() => scrollByDir(-1)}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full text-white hover:opacity-90 transition-opacity md:left-4"
          style={{ backgroundColor: "var(--brand-navy)" }}
          aria-label="Previous products"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => scrollByDir(1)}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full text-white hover:opacity-90 transition-opacity md:right-4"
          style={{ backgroundColor: "var(--brand-navy)" }}
          aria-label="Next products"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loading ? (
            <div
              className="flex items-center justify-center py-24 min-w-full"
              style={{ fontFamily: "var(--font-inter), Inter, sans-serif", color: "#F2F6EF" }}
            >
              Loading products…
            </div>
          ) : products.length > 0 ? (
            products.slice(0, 9).map((product) => (
              <div key={product.id} className="shrink-0 w-[387px]">
                <ExploreProductCard product={product} />
              </div>
            ))
          ) : (
            <p
              className="min-w-full text-center py-12 text-white"
              style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "16px" }}
            >
              No products in this collection. Add products in Shopify and assign them to the collection.
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 mt-12 flex justify-center">
        <Link href={safeHref(cta?.href) || "#shop"} className="btn-primary">
          {cta?.label ?? "SHOP FULL LINEUP →"}
        </Link>
      </div>
    </>
  );
}
