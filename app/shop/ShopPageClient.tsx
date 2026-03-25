"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFooterWaveOverride } from "@/app/context/FooterWaveOverride";
import { PromoBanner } from "@/components/PromoBanner";
import { CategoryFilterBar } from "@/components/sections/CategoryFilterBar";
import { CategorySectionBlock } from "@/components/sections/CategorySectionBlock";
import { ShopProductCarousel } from "./ShopProductCarousel";
import { ShopSectionWave } from "./ShopSectionWave";
import type { CategorySectionBlockData } from "@/components/sections/CategorySectionBlock";
import type { ApiProductForCarousel } from "@/lib/types";
import type { ShopProductCarouselBlock } from "./ShopProductCarousel";
import {
  resolveShopPathSegment,
  shopPathSegmentFromValue,
} from "@/lib/shopPathSegment";

function resolveFiltersFromUrl(
  urls: string[] | undefined,
  options: Array<{ value: string }>,
): string[] {
  if (!urls?.length) return [];
  return urls
    .map((raw) => {
      const t = raw.trim();
      const exact = options.find((f) => f.value === t);
      if (exact) return exact.value;
      return options.find(
        (f) => f.value.toLowerCase() === t.toLowerCase(),
      )?.value;
    })
    .filter((v): v is string => Boolean(v));
}

export function ShopPageClient({
  promoBanner,
  promoBannerUrl,
  filterOptions,
  collectionSections,
  productCarouselBlock,
  productCarouselInitialProducts = [],
  initialCategoryFromUrl = null,
  initialFilterValuesFromUrl = [],
  initialSectionProductsByHandle = {},
}: {
  promoBanner: string | null;
  promoBannerUrl?: string | null;
  filterOptions: Array<{
    value: string;
    label: string;
    insertAfterCategory?: string;
  }>;
  collectionSections: CategorySectionBlockData[];
  /** Catch of the Day carousel block (from home page config). Rendered at bottom of shop page. */
  productCarouselBlock?: ShopProductCarouselBlock | null;
  /** Pre-fetched products for the carousel's first collection. */
  productCarouselInitialProducts?: ApiProductForCarousel[];
  /** When set (e.g. /shop/seafood), preselect this collection so only that section is shown. */
  initialCategoryFromUrl?: string | null;
  /** When set (e.g. /shop/salmon), preselect this product-type filter from Sanity shopFilterOptions. */
  initialFilterValuesFromUrl?: string[];
  /** Server-prefetched products per collection handle (skips client loading skeleton). */
  initialSectionProductsByHandle?: Record<string, ApiProductForCarousel[]>;
}) {
  const categoryOptions = collectionSections.map((s) => ({
    value: s.collectionHandle,
    label: s.title.replace(/\s+/g, " ").trim() || s.collectionHandle,
  }));

  const params = useParams();
  /** Dynamic segment from `/shop/[category]` — source of truth on client navigations (Explore → shop). */
  const pathSegmentFromUrl = useMemo(() => {
    const raw = params?.category;
    if (typeof raw !== "string" || !raw.trim()) return null;
    try {
      return decodeURIComponent(raw).trim();
    } catch {
      return raw.trim();
    }
  }, [params?.category]);

  /**
   * Match server-side `getShopPageData` + `resolveShopPathSegment` (fuzzy hyphen/space, filter vs collection).
   * Prefer the URL segment when present so pills stay in sync after client transitions; fall back to SSR props.
   */
  const resolvedFromUrl = useMemo(() => {
    const segment =
      pathSegmentFromUrl?.trim() || initialCategoryFromUrl?.trim() || "";
    if (!segment) {
      return {
        category: null as string | null,
        filters: resolveFiltersFromUrl(initialFilterValuesFromUrl, filterOptions),
      };
    }
    const r = resolveShopPathSegment(
      segment,
      collectionSections,
      filterOptions,
    );
    if (r?.kind === "collection") {
      return { category: r.handle, filters: [] as string[] };
    }
    if (r?.kind === "filter") {
      return { category: null as string | null, filters: [r.value] };
    }
    return {
      category: null as string | null,
      filters: resolveFiltersFromUrl(initialFilterValuesFromUrl, filterOptions),
    };
  }, [
    pathSegmentFromUrl,
    initialCategoryFromUrl,
    initialFilterValuesFromUrl,
    collectionSections,
    filterOptions,
  ]);

  const [selectedFilterValues, setSelectedFilterValues] = useState<string[]>(
    () => resolvedFromUrl.filters,
  );
  const [selectedCategoryHandles, setSelectedCategoryHandles] = useState<
    string[]
  >(() => (resolvedFromUrl.category ? [resolvedFromUrl.category] : []));

  useEffect(() => {
    setSelectedFilterValues([...resolvedFromUrl.filters]);
    setSelectedCategoryHandles(
      resolvedFromUrl.category ? [resolvedFromUrl.category] : [],
    );
  }, [
    resolvedFromUrl.category,
    resolvedFromUrl.filters.join("\u0001"),
  ]);

  const router = useRouter();

  const handleFilterChange = (values: string[]) => {
    setSelectedFilterValues(values);
    setSelectedCategoryHandles([]);
    if (values.length === 0) {
      router.push("/shop", { scroll: false });
    } else {
      const v = values[0];
      router.push(`/shop/${shopPathSegmentFromValue(v)}`, { scroll: false });
    }
  };

  const toggleCategory = (handle: string) => {
    const isSameHandle = (a: string, b: string) =>
      a.toLowerCase() === b.toLowerCase();
    // Already on this category (e.g. arrived from Explore). Second tap used to clear → /shop; keep URL.
    if (
      selectedCategoryHandles.length === 1 &&
      isSameHandle(selectedCategoryHandles[0]!, handle)
    ) {
      return;
    }
    const next = selectedCategoryHandles.some((h) => isSameHandle(h, handle))
      ? []
      : [handle];
    setSelectedCategoryHandles(next);
    setSelectedFilterValues([]);
    if (next.length === 0) {
      router.push("/shop", { scroll: false });
    } else {
      router.push(`/shop/${shopPathSegmentFromValue(handle)}`, { scroll: false });
    }
  };

  const visibleSections =
    selectedCategoryHandles.length === 0
      ? collectionSections
      : collectionSections.filter((s) =>
          selectedCategoryHandles.some(
            (h) => h.toLowerCase() === s.collectionHandle.toLowerCase(),
          ),
        );

  const hasSelection =
    selectedFilterValues.length > 0 || selectedCategoryHandles.length > 0;
  const clearAll = () => {
    setSelectedFilterValues([]);
    setSelectedCategoryHandles([]);
    router.push("/shop", { scroll: false });
  };

  const setFooterWaveOverride = useFooterWaveOverride();
  useEffect(() => {
    if (!setFooterWaveOverride) return;
    if (hasSelection) {
      setFooterWaveOverride.setOverride("#D4F2FF");
    } else {
      setFooterWaveOverride.setOverride(null);
    }
    return () => setFooterWaveOverride.setOverride(null);
  }, [hasSelection, setFooterWaveOverride]);

  return (
    <main
      className="min-h-[50vh] pt-[140px] pb-0 sm:pt-[170px] md:pt-[230px]"
      style={{ backgroundColor: "var(--brand-light-blue-bg)" }}
    >
      <CategoryFilterBar
        filterOptions={filterOptions}
        selectedValues={selectedFilterValues}
        onChange={handleFilterChange}
        categoryOptions={categoryOptions}
        selectedCategoryHandles={selectedCategoryHandles}
        onCategoryClick={toggleCategory}
        hasSelection={hasSelection}
        onClearAll={clearAll}
      />

      {promoBanner ? <PromoBanner text={promoBanner} href={promoBannerUrl} /> : null}

      {visibleSections.map((block, idx) => (
        <Fragment key={`${block.collectionHandle}-${idx}`}>
          <CategorySectionBlock
            block={block}
            selectedFilterValues={selectedFilterValues}
            hasWaveAbove={!hasSelection && idx > 0}
            initialProducts={initialSectionProductsByHandle[block.collectionHandle]}
          />
          {!hasSelection && idx < visibleSections.length - 1 ? (
            <ShopSectionWave />
          ) : null}
        </Fragment>
      ))}

      {productCarouselBlock && !hasSelection ? (
        /* Light carousel bg → multiply blend on product shots (see docs/PRODUCT_CAROUSEL_IMAGE_BACKGROUNDS.md) */
        <ShopProductCarousel
          block={productCarouselBlock}
          initialProducts={productCarouselInitialProducts}
          selectedFilterValues={selectedFilterValues}
          backgroundColorOverride="#F2F2F5"
        />
      ) : null}
    </main>
  );
}
