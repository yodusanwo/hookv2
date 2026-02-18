import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExploreProductsGrid } from "./ExploreProductsGrid";

type FilterCollection = { label?: string; collectionHandle?: string };
type Category = { label?: string; collectionHandle?: string };

type ExploreProductsBlock = {
  title?: string;
  description?: string;
  filterCollections?: FilterCollection[];
  filterLabels?: string[];
  categories?: Category[];
  cta?: { label?: string; href?: string };
};

const DEFAULT_TITLE = "Catch of the day";
const DEFAULT_DESCRIPTION =
  "Wild Alaskan seafood boxes, fillets, and specialty cuts ranging from sockeye and sablefish to halibut, cod, scallops, and even salmon heads are offered as premium, wild-caught options. All wild. All the time.";
const DEFAULT_CTA = { label: "SHOP FULL LINEUP →", href: "#shop" };

const DEFAULT_FILTER_COLLECTIONS: FilterCollection[] = [
  { label: "Seafood", collectionHandle: "seafood" },
  { label: "Subscription Box", collectionHandle: "subscription-box" },
  { label: "Pet Treats, Merch, Gift Cards", collectionHandle: "pet-treats" },
];

export function ExploreProductsSection({ block }: { block: ExploreProductsBlock }) {
  const title = block.title ?? DEFAULT_TITLE;
  const description = block.description ?? DEFAULT_DESCRIPTION;
  const cta = block.cta ?? DEFAULT_CTA;

  // Use filterCollections if set; else build from legacy categories; else use defaults
  const filterCollections =
    block.filterCollections && block.filterCollections.length > 0
      ? block.filterCollections.filter((f) => f.label || f.collectionHandle)
      : block.categories && block.categories.length > 0
        ? block.categories.map((c) => ({
            label: c.label ?? "Shop",
            collectionHandle: c.collectionHandle ?? "",
          }))
        : DEFAULT_FILTER_COLLECTIONS;

  return (
    <section
      id="shop"
      className="relative z-20 overflow-visible pt-14 pb-0 border-2 border-amber-500"
      style={{ backgroundColor: "var(--brand-navy)" }}
    >
      <div className="mx-auto w-full max-w-[1052px] px-4">
        <SectionHeading
          title={title}
          description={description}
          variant="display"
          theme="dark"
          descriptionAsLead
        />
      </div>

      <ExploreProductsGrid filterCollections={filterCollections} cta={cta} />

      {/* Waves at bottom of section (flipped horizontally) */}
      <div className="relative z-10 w-full overflow-visible leading-[0] -mt-px [transform:scaleX(-1)] bg-[#D4F2FF]">
        <img
          src="/VectorWavyNavy.svg"
          alt=""
          aria-hidden
          className="relative z-10 block w-full h-auto min-h-0 align-bottom"
        />
        <img
          src="/VectorWavyBlue.svg"
          alt=""
          aria-hidden
          className="relative z-0 block w-full h-auto min-h-0 align-bottom -mt-8 sm:-mt-12 md:-mt-20 lg:-mt-[100px]"
        />
      </div>
    </section>
  );
}
