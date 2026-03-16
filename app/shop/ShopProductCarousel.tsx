"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { CatchOfTheDayGrid } from "@/components/sections/CatchOfTheDayGrid";
import { isLightBackgroundColor } from "@/lib/theme";
import type { ApiProductForCarousel } from "@/lib/types";
import type { FilterItem } from "@/lib/types";

const DEFAULT_TITLE = "CATCH OF THE DAY";
const DEFAULT_DESCRIPTION =
  "Wild Alaskan seafood boxes, fillets, and specialty cuts ranging from sockeye and sablefish to halibut, cod, scallops, and even salmon heads are offered as premium, wild-caught options. All wild. All the time.";

const LIGHT_TEXT_COLOR = "#1E1E1E";

export type ShopProductCarouselBlock = {
  backgroundColor?: string;
  title?: string;
  description?: string;
  filterCollections?: FilterItem[];
};

export function ShopProductCarousel({
  block,
  initialProducts = [],
  selectedFilterValues = [],
  backgroundColorOverride,
}: {
  block: ShopProductCarouselBlock;
  initialProducts?: ApiProductForCarousel[];
  selectedFilterValues?: string[];
  /** When set (e.g. on /shop page), section uses this background and light text #1E1E1E. */
  backgroundColorOverride?: string;
}) {
  const filterCollections =
    block.filterCollections && block.filterCollections.length > 0
      ? block.filterCollections.filter((f) => f.label || f.collectionHandle)
      : [
          { label: "Seafood", collectionHandle: "seafood" },
          { label: "Subscription Box", collectionHandle: "subscription-box" },
          { label: "Pet Treats, Merch, Gift Cards", collectionHandle: "pet-treats" },
        ];

  const title = block.title ?? DEFAULT_TITLE;
  const description = block.description ?? DEFAULT_DESCRIPTION;
  const sectionBg = backgroundColorOverride ?? block.backgroundColor ?? "#171730";
  const isLightBg = Boolean(backgroundColorOverride) || isLightBackgroundColor(block.backgroundColor);
  const textTheme = isLightBg ? "light" : "dark";

  return (
    <section
      id="catch-of-the-day"
      className="relative z-20 overflow-visible py-8 sm:py-10 lg:py-12"
      style={{ backgroundColor: sectionBg, ["--section-bg" as string]: sectionBg }}
    >
      <div className="mx-auto w-full max-w-[1100px] px-4">
        <SectionHeading
          title={title}
          description={description}
          variant="display"
          theme={textTheme}
          titleColor={isLightBg ? LIGHT_TEXT_COLOR : undefined}
          descriptionColor={isLightBg ? LIGHT_TEXT_COLOR : undefined}
          descriptionAsLead
        />
      </div>

      <CatchOfTheDayGrid
        filterCollections={filterCollections}
        initialProducts={initialProducts}
        hideCollectionTabs
        selectedProductTypeFilter={selectedFilterValues}
        matchProductTypesAsCommaSeparated
        darkSection={!isLightBg}
      />
    </section>
  );
}
