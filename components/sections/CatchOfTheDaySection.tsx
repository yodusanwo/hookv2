import { SectionHeading } from "@/components/ui/SectionHeading";
import { CatchOfTheDayGrid } from "./CatchOfTheDayGrid";

type FilterCollection = { label?: string; collectionHandle?: string };

type CatchOfTheDayBlock = {
  title?: string;
  description?: string;
  filterCollections?: FilterCollection[];
  cta?: { label?: string; href?: string };
};

const DEFAULT_TITLE = "CATCH OF THE DAY";
const DEFAULT_DESCRIPTION =
  "Wild Alaskan seafood boxes, fillets, and specialty cuts ranging from sockeye and sablefish to halibut, cod, scallops, and even salmon heads are offered as premium, wild-caught options. All wild. All the time.";
const DEFAULT_CTA = { label: "SHOP FULL LINEUP →", href: "#shop" };

const DEFAULT_FILTER_COLLECTIONS: FilterCollection[] = [
  { label: "Seafood", collectionHandle: "seafood" },
  { label: "Subscription Box", collectionHandle: "subscription-box" },
  { label: "Pet Treats, Merch, Gift Cards", collectionHandle: "pet-treats" },
];

export function CatchOfTheDaySection({ block }: { block: CatchOfTheDayBlock }) {
  const title = block.title ?? DEFAULT_TITLE;
  const description = block.description ?? DEFAULT_DESCRIPTION;
  const cta = block.cta ?? DEFAULT_CTA;

  const filterCollections =
    block.filterCollections && block.filterCollections.length > 0
      ? block.filterCollections.filter((f) => f.label || f.collectionHandle)
      : DEFAULT_FILTER_COLLECTIONS;

  return (
    <section
      id="catch-of-the-day"
      className="relative z-20 overflow-visible py-14"
      style={{ backgroundColor: "var(--brand-navy)" }}
    >
      <div className="mx-auto w-full max-w-[1100px] px-4">
        <SectionHeading
          title={title}
          description={description}
          variant="display"
          theme="dark"
          descriptionAsLead
          titleFontFamily="var(--font-zamenhof)"
        />
      </div>

      <CatchOfTheDayGrid filterCollections={filterCollections} cta={cta} />
    </section>
  );
}
