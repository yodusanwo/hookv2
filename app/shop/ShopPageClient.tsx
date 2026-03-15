"use client";

import { Fragment, useEffect, useState } from "react";
import { useFooterWaveOverride } from "@/app/context/FooterWaveOverride";
import { PromoBanner } from "@/components/PromoBanner";
import { CategoryFilterBar } from "@/components/sections/CategoryFilterBar";
import { CategorySectionBlock } from "@/components/sections/CategorySectionBlock";
import { ShopProductCarousel } from "./ShopProductCarousel";
import { ShopSectionWave } from "./ShopSectionWave";
import type { CategorySectionBlockData } from "@/components/sections/CategorySectionBlock";
import type { ApiProductForCarousel } from "@/lib/types";
import type { ShopProductCarouselBlock } from "./ShopProductCarousel";

export function ShopPageClient({
  promoBanner,
  filterOptions,
  collectionSections,
  productCarouselBlock,
  productCarouselInitialProducts = [],
}: {
  promoBanner: string | null;
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
}) {
  const [selectedFilterValues, setSelectedFilterValues] = useState<string[]>(
    [],
  );
  const [selectedCategoryHandles, setSelectedCategoryHandles] = useState<
    string[]
  >([]);

  const categoryOptions = collectionSections.map((s) => ({
    value: s.collectionHandle,
    label: s.title.replace(/\s+/g, " ").trim() || s.collectionHandle,
  }));

  const handleFilterChange = (values: string[]) => {
    setSelectedFilterValues(values);
    setSelectedCategoryHandles([]);
  };

  const toggleCategory = (handle: string) => {
    const next = selectedCategoryHandles.includes(handle) ? [] : [handle];
    setSelectedCategoryHandles(next);
    setSelectedFilterValues([]);
    // No scroll — filter-only behavior so selection consistently filters visible content
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
      className="pt-[140px] pb-0 sm:pt-[170px] md:pt-[230px]"
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

      {promoBanner ? <PromoBanner text={promoBanner} /> : null}

      {visibleSections.map((block, idx) => (
        <Fragment key={`${block.collectionHandle}-${idx}`}>
          <CategorySectionBlock
            block={block}
            selectedFilterValues={selectedFilterValues}
            hasWaveAbove={!hasSelection && idx > 0}
          />
          {!hasSelection && idx < visibleSections.length - 1 ? (
            <ShopSectionWave />
          ) : null}
        </Fragment>
      ))}

      {productCarouselBlock && !hasSelection ? (
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
