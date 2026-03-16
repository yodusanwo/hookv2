/**
 * Product Carousel section (separate from the first "Catch of the day" section).
 * Sizing and layout here are independent; changing this does not affect ExploreProductsSection.
 * Pre-fetches the first collection's products on the server so the section doesn't show "Loading products…" on hard refresh.
 */
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CatchOfTheDayGrid } from "./CatchOfTheDayGrid";
import { getCollectionProductsForCarousel } from "@/lib/getCollectionProductsForCarousel";
import { isLightBackgroundColor } from "@/lib/theme";
import type { FilterItem } from "@/lib/types";

type CatchOfTheDayBlock = {
  backgroundColor?: string;
  title?: string;
  description?: string;
  filterCollections?: FilterItem[];
  cta?: { label?: string; href?: string };
};

const DEFAULT_TITLE = "CATCH OF THE DAY";
const DEFAULT_DESCRIPTION =
  "Wild Alaskan seafood boxes, fillets, and specialty cuts ranging from sockeye and sablefish to halibut, cod, scallops, and even salmon heads are offered as premium, wild-caught options. All wild. All the time.";

const DEFAULT_FILTER_COLLECTIONS: FilterItem[] = [
  { label: "Seafood", collectionHandle: "seafood" },
  { label: "Subscription Box", collectionHandle: "subscription-box" },
  { label: "Pet Treats, Merch, Gift Cards", collectionHandle: "pet-treats" },
];

export async function CatchOfTheDaySection({
  block,
  hideCollectionTabs = false,
}: {
  block: CatchOfTheDayBlock;
  /** When true, hide the Seafood / Subscription Box / etc. tabs (e.g. on /shop page). */
  hideCollectionTabs?: boolean;
}) {
  const title = block.title ?? DEFAULT_TITLE;
  const description = block.description ?? DEFAULT_DESCRIPTION;

  const filterCollections =
    block.filterCollections && block.filterCollections.length > 0
      ? block.filterCollections.filter((f) => f.label || f.collectionHandle)
      : DEFAULT_FILTER_COLLECTIONS;

  const firstHandle = filterCollections[0]?.collectionHandle?.trim() ?? "";
  const initialProducts = firstHandle
    ? await getCollectionProductsForCarousel(firstHandle)
    : [];

  const isLightBg = isLightBackgroundColor(block.backgroundColor);
  const textTheme = isLightBg ? "light" : "dark";
  const LIGHT_TEXT_COLOR = "#1E1E1E";

  return (
    <section
      id="catch-of-the-day"
      className="relative z-20 overflow-visible py-12 sm:py-10 lg:py-12"
      style={{
        backgroundColor: block.backgroundColor ?? "#171730",
        ["--section-bg" as string]: block.backgroundColor ?? "#171730",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-6 md:px-4">
        <SectionHeading
          title={title}
          description={description}
          variant="display"
          theme={textTheme}
          titleColor={isLightBg ? LIGHT_TEXT_COLOR : undefined}
          descriptionColor={isLightBg ? LIGHT_TEXT_COLOR : undefined}
          descriptionAsLead
          titleFontFamily="var(--font-zamenhof-inline), var(--font-inter), Inter, sans-serif"
        />
      </div>

      <CatchOfTheDayGrid
        filterCollections={filterCollections}
        initialProducts={initialProducts}
        hideCollectionTabs={hideCollectionTabs}
        darkSection={!isLightBg}
      />
    </section>
  );
}
