"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFooterWaveOverride } from "@/app/context/FooterWaveOverride";
import { PromoBanner } from "@/components/PromoBanner";
import { CategoryFilterBar } from "@/components/sections/CategoryFilterBar";
import { CategorySectionBlock } from "@/components/sections/CategorySectionBlock";
import { ShopProductCarousel } from "./ShopProductCarousel";
import { ShopSectionWave } from "./ShopSectionWave";
import type { CategorySectionBlockData } from "@/components/sections/CategorySectionBlock";
import type { ApiProductForCarousel } from "@/lib/types";
import type { ShopProductCarouselBlock } from "./ShopProductCarousel";
import { shopPathSegmentFromValue } from "@/lib/shopPathSegment";

function resolveCategoryFromUrl(
  raw: string | null | undefined,
  sections: CategorySectionBlockData[],
): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  const exact = sections.find((s) => s.collectionHandle === t);
  if (exact) return exact.collectionHandle;
  const ci = sections.find(
    (s) => s.collectionHandle.toLowerCase() === t.toLowerCase(),
  );
  return ci?.collectionHandle ?? null;
}

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

  const resolvedCategory = useMemo(
    () => resolveCategoryFromUrl(initialCategoryFromUrl, collectionSections),
    [initialCategoryFromUrl, collectionSections],
  );

  const resolvedFilters = useMemo(
    () => resolveFiltersFromUrl(initialFilterValuesFromUrl, filterOptions),
    [initialFilterValuesFromUrl, filterOptions],
  );

  const [selectedFilterValues, setSelectedFilterValues] = useState<string[]>(
    () => resolvedFilters,
  );
  const [selectedCategoryHandles, setSelectedCategoryHandles] = useState<
    string[]
  >(() => (resolvedCategory ? [resolvedCategory] : []));

  const urlCategoryKey = initialCategoryFromUrl ?? "";
  const urlFiltersKey = (initialFilterValuesFromUrl ?? []).join("\u0001");

  /** When CMS data streams in, resolvedCategory can go from null → handle without URL changing; must resync or pills stay empty and the next click toggles off → router.push("/shop"). */
  const resolvedFiltersKey = resolvedFilters.join("\u0001");

  useEffect(() => {
    setSelectedFilterValues([...resolvedFilters]);
    setSelectedCategoryHandles(resolvedCategory ? [resolvedCategory] : []);
  }, [urlCategoryKey, urlFiltersKey, resolvedCategory, resolvedFiltersKey]);

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
    // Already on this category (e.g. arrived from Explore). Second tap used to clear → /shop; keep URL.
    if (selectedCategoryHandles.length === 1 && selectedCategoryHandles[0] === handle) {
      return;
    }
    const next = selectedCategoryHandles.includes(handle) ? [] : [handle];
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
          selectedCategoryHandles.includes(s.collectionHandle),
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
