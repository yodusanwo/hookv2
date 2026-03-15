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
}: {
  promoBanner: string | null;
  filterOptions: Array<{ value: string; label: string }>;
  collectionSections: CategorySectionBlockData[];
}) {
  const [selectedFilterValues, setSelectedFilterValues] = useState<string[]>([]);

  return (
    <main
      className="pt-[140px] pb-14 sm:pt-[170px] md:pt-[230px]"
      style={{ backgroundColor: "var(--brand-light-blue-bg)" }}
    >
      <CategoryFilterBar
        filterOptions={filterOptions}
        selectedValues={selectedFilterValues}
        onChange={setSelectedFilterValues}
        categoryOptions={collectionSections.map((s) => ({
          value: s.collectionHandle,
          label: s.title.replace(/\s+/g, " ").trim() || s.collectionHandle,
        }))}
      />

      {promoBanner ? <PromoBanner text={promoBanner} /> : null}

      {collectionSections.map((block, idx) => (
        <CategorySectionBlock
          key={`${block.collectionHandle}-${idx}`}
          block={block}
          selectedFilterValues={selectedFilterValues}
        />
      ))}
    </main>
  );
}
