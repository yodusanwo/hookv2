/**
 * First "Catch of the day" section (appears after Home/Hero).
 * Shows category cards (image + label) with carousel arrows. Independent of Product Carousel section.
 */
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { ExploreProductsCategoryCarousel } from "./ExploreProductsCategoryCarousel";
import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";
import Link from "next/link";

type FilterCollection = { label?: string; collectionHandle?: string; image?: { _ref?: string; asset?: { _ref?: string } } };
type Category = { label?: string; collectionHandle?: string };

type ExploreProductsBlock = {
  title?: string;
  description?: string;
  filterCollections?: FilterCollection[];
  filterLabels?: string[];
  categories?: Category[];
  cta?: { label?: string; href?: string };
};

const DEFAULT_TITLE = "EXPLORE OUR PRODUCTS";
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

  // Build category list: filterCollections (with optional image) or legacy categories
  const filterCollections =
    block.filterCollections && block.filterCollections.length > 0
      ? block.filterCollections.filter((f) => f.label || f.collectionHandle)
      : block.categories && block.categories.length > 0
        ? block.categories.map((c) => ({
            label: c.label ?? "Shop",
            collectionHandle: c.collectionHandle ?? "",
            image: undefined,
          }))
        : DEFAULT_FILTER_COLLECTIONS;

  const categories = filterCollections.map((f) => {
    const href = f.collectionHandle?.trim()
      ? `/collections/${f.collectionHandle.trim()}`
      : "#shop";
    const img = urlFor(f.image);
    return {
      label: f.label ?? "Shop",
      href,
      imageUrl: img ? img.url() : null,
    };
  });

  return (
    <section
      id="shop"
      className="relative z-20 overflow-visible pt-14 pb-0"
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

      <ExploreProductsCategoryCarousel categories={categories} />

      {cta?.label && (
        <div className="mx-auto max-w-6xl px-4 mt-12 flex justify-center">
          <Link href={safeHref(cta.href) || "#shop"} className="btn-primary">
            {cta.label}
          </Link>
        </div>
      )}

      <div className="w-full shrink-0 overflow-visible">
        <div className="wave-full-bleed shrink-0">
          <WaveDivider
            navySrc="/VectorWavyNavy.svg"
            wrapperClassName="-mt-px [transform:scaleX(-1)] bg-[#D4F2FF]"
            navyOutline="bottom"
          />
        </div>
      </div>
    </section>
  );
}
