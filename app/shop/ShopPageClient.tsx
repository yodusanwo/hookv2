"use client";

import { useState } from "react";
import { PromoBanner } from "@/components/PromoBanner";
import { CategoryFilterBar } from "@/components/sections/CategoryFilterBar";
import { CategorySectionBlock } from "@/components/sections/CategorySectionBlock";
import { ShopProductCarousel } from "./ShopProductCarousel";
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
  filterOptions: Array<{ value: string; label: string; insertAfterCategory?: string }>;
  collectionSections: CategorySectionBlockData[];
  /** Product Carousel block data (from home page config). Rendered between filter bar and promo banner. */
  productCarouselBlock?: ShopProductCarouselBlock | null;
  /** Pre-fetched products for the carousel's first collection. */
  productCarouselInitialProducts?: ApiProductForCarousel[];
}) {
  const [selectedFilterValues, setSelectedFilterValues] = useState<string[]>([]);
  const [selectedCategoryHandles, setSelectedCategoryHandles] = useState<string[]>([]);

  const categoryOptions = collectionSections.map((s) => ({
    value: s.collectionHandle,
    label: s.title.replace(/\s+/g, " ").trim() || s.collectionHandle,
  }));

  const toggleCategory = (handle: string) => {
    setSelectedCategoryHandles((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
    );
    const el = document.getElementById(`shop-section-${handle}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const visibleSections =
    selectedCategoryHandles.length === 0
      ? collectionSections
      : collectionSections.filter((s) =>
          selectedCategoryHandles.includes(s.collectionHandle)
        );

  const hasSelection = selectedFilterValues.length > 0 || selectedCategoryHandles.length > 0;
  const clearAll = () => {
    setSelectedFilterValues([]);
    setSelectedCategoryHandles([]);
  };

  return (
    <main
      className="pt-[140px] pb-14 sm:pt-[170px] md:pt-[230px]"
      style={{ backgroundColor: "var(--brand-light-blue-bg)" }}
    >
      <CategoryFilterBar
        filterOptions={filterOptions}
        selectedValues={selectedFilterValues}
        onChange={setSelectedFilterValues}
        categoryOptions={categoryOptions}
        selectedCategoryHandles={selectedCategoryHandles}
        onCategoryClick={toggleCategory}
        hasSelection={hasSelection}
        onClearAll={clearAll}
      />

      {productCarouselBlock ? (
        <ShopProductCarousel
          block={productCarouselBlock}
          initialProducts={productCarouselInitialProducts}
          selectedFilterValues={selectedFilterValues}
        />
      ) : null}

      {promoBanner ? <PromoBanner text={promoBanner} /> : null}

      {visibleSections.map((block, idx) => (
        <CategorySectionBlock
          key={`${block.collectionHandle}-${idx}`}
          block={block}
          selectedFilterValues={selectedFilterValues}
        />
      ))}
    </main>
  );
}
