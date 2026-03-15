"use client";

import { useState } from "react";
import { PromoBanner } from "@/components/PromoBanner";
import { CategoryFilterBar } from "@/components/sections/CategoryFilterBar";
import { CategorySectionBlock } from "@/components/sections/CategorySectionBlock";
// Product Carousel (commented out – may restore later)
// import { ShopProductCarousel } from "./ShopProductCarousel";
import type { CategorySectionBlockData } from "@/components/sections/CategorySectionBlock";
// import type { ApiProductForCarousel } from "@/lib/types";
// import type { ShopProductCarouselBlock } from "./ShopProductCarousel";

export function ShopPageClient({
  promoBanner,
  filterOptions,
  collectionSections,
  // productCarouselBlock,
  // productCarouselInitialProducts = [],
}: {
  promoBanner: string | null;
  filterOptions: Array<{ value: string; label: string; insertAfterCategory?: string }>;
  collectionSections: CategorySectionBlockData[];
  /** Product Carousel (commented out – may restore later) */
  // productCarouselBlock?: ShopProductCarouselBlock | null;
  // productCarouselInitialProducts?: ApiProductForCarousel[];
}) {
  const [selectedFilterValues, setSelectedFilterValues] = useState<string[]>([]);
  const [selectedCategoryHandles, setSelectedCategoryHandles] = useState<string[]>([]);

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
        onChange={handleFilterChange}
        categoryOptions={categoryOptions}
        selectedCategoryHandles={selectedCategoryHandles}
        onCategoryClick={toggleCategory}
        hasSelection={hasSelection}
        onClearAll={clearAll}
      />

      {/* Product Carousel (commented out – may restore later)
      {productCarouselBlock ? (
        <ShopProductCarousel
          block={productCarouselBlock}
          initialProducts={productCarouselInitialProducts}
          selectedFilterValues={selectedFilterValues}
        />
      ) : null}
      */}

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
