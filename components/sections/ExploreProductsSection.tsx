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
      className="relative z-20 overflow-hidden py-16"
      style={{ backgroundColor: "#F8FCFF" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2
          className="text-center font-semibold tracking-tight"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "#4F7F9D",
          }}
        >
          {title}
        </h2>
        <p
          className="mx-auto mt-6 max-w-3xl text-center leading-relaxed"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 400,
            color: "#4A4A4A",
          }}
        >
          {description}
        </p>
      </div>

      <ExploreProductsGrid filterCollections={filterCollections} cta={cta} />
    </section>
  );
}
