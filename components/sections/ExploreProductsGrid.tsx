"use client";

import * as React from "react";
import Link from "next/link";
import { safeHref } from "@/lib/urlValidation";
import { ExploreProductCard, type ExploreProductCardProduct } from "@/app/components/ExploreProductCard";
import { ExploreFilters } from "./ExploreFilters";

type FilterItem = { label?: string; collectionHandle?: string };

export function ExploreProductsGrid({
  filterCollections,
  cta,
}: {
  filterCollections: FilterItem[];
  cta?: { label?: string; href?: string };
}) {
  const [products, setProducts] = React.useState<ExploreProductCardProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const filters = React.useMemo(
    () =>
      filterCollections.length > 0
        ? filterCollections
        : [{ label: "All Products", collectionHandle: "" }],
    [filterCollections]
  );

  const labels = React.useMemo(() => filters.map((f) => f.label ?? "Shop"), [filters]);

  React.useEffect(() => {
    const current = filters[activeIndex];
    const collectionHandle = current?.collectionHandle;
    const controller = new AbortController();

    setLoading(true);
    const url = collectionHandle?.trim()
      ? `/api/collections/${encodeURIComponent(collectionHandle.trim())}/products`
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
  }, [activeIndex, filters]);

  const handleFilterChange = React.useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <>
      <div className="mt-10">
        <ExploreFilters
          labels={labels}
          activeIndex={activeIndex}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className="mt-10 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-[25px] pr-[25px]">
        {loading ? (
          <div
            className="col-span-full flex items-center justify-center py-24"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif", color: "#4A4A4A" }}
          >
            Loading products…
          </div>
        ) : products.length > 0 ? (
          products.slice(0, 3).map((product) => (
            <ExploreProductCard key={product.id} product={product} />
          ))
        ) : (
          <p
            className="col-span-full text-center py-12"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "16px", color: "#4A4A4A" }}
          >
            No products in this collection. Add products in Shopify and assign them to the collection.
          </p>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4 mt-12 flex justify-center">
        <Link
          href={safeHref(cta?.href) || "#shop"}
          className="inline-flex h-12 items-center justify-center rounded-lg px-6 font-semibold text-white transition-colors hover:opacity-90"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "16px",
            backgroundColor: "#1F5780",
          }}
        >
          {cta?.label ?? "SHOP FULL LINEUP →"}
        </Link>
      </div>
    </>
  );
}
