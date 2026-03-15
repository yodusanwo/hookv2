"use client";

import { useState } from "react";
import { PromoBanner } from "@/components/PromoBanner";
import { CategoryFilterBar } from "@/components/sections/CategoryFilterBar";
import { CategorySectionBlock } from "@/components/sections/CategorySectionBlock";
import type { CategorySectionBlockData } from "@/components/sections/CategorySectionBlock";

export function ShopPageClient({
  promoBanner,
  filterOptions,
  collectionSections,
  productCarousel,
}: {
  promoBanner: string | null;
  filterOptions: Array<{ value: string; label: string; insertAfterCategory?: string }>;
  collectionSections: CategorySectionBlockData[];
  /** Product Carousel (Catch of the Day) - rendered between filter bar and promo banner. */
  productCarousel?: React.ReactNode;
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

      {productCarousel}

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
