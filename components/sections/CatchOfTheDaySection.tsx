/**
 * Product Carousel section (separate from the first "Catch of the day" section).
 * Sizing and layout here are independent; changing this does not affect ExploreProductsSection.
 * Pre-fetches the first collection's products on the server so the section doesn't show "Loading products…" on hard refresh.
 */
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CatchOfTheDayGrid } from "./CatchOfTheDayGrid";
import { getCollectionProductsForCarousel } from "@/lib/getCollectionProductsForCarousel";
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
}: {
  block: CatchOfTheDayBlock;
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

  return (
    <section
      id="catch-of-the-day"
      className="relative z-20 overflow-visible py-8 sm:py-10 lg:py-12"
      style={{ backgroundColor: block.backgroundColor ?? "#171730" }}
    >
      <div className="mx-auto w-full max-w-[1100px] px-4">
        <SectionHeading
          title={title}
          description={description}
          variant="display"
          theme="dark"
          descriptionAsLead
          titleFontFamily="var(--font-zamenhof-inline), var(--font-inter), Inter, sans-serif"
        />
      </div>

      <CatchOfTheDayGrid
        filterCollections={filterCollections}
        initialProducts={initialProducts}
      />
    </section>
  );
}
