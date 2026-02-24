"use client";

/**
 * Grid for the first "Catch of the day" section only.
 * Card sizes and layout here do not affect the Product Carousel section.
 */
import * as React from "react";
import Link from "next/link";
import { safeHref } from "@/lib/urlValidation";
import { ExploreProductCard, type ExploreProductCardProduct } from "@/app/components/ExploreProductCard";

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

  return (
    <>
      <div className="mt-10">
        <div className="relative mx-auto w-full max-w-[1363px]">
          {loading ? (
            <div
              className="flex items-center justify-center py-24"
              style={{ fontFamily: "var(--font-inter), Inter, sans-serif", color: "#F2F6EF" }}
            >
              Loading products…
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center items-start" style={{ gap: "6px" }}>
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="w-[331px] max-w-full">
                  <ExploreProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <p
              className="text-center py-12 text-white"
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
