/**
 * First "Catch of the day" section (appears after Home/Hero).
 * Shows category cards (image + label) with carousel arrows. Independent of Product Carousel section.
 */
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { ExploreProductsCategoryCarousel } from "./ExploreProductsCategoryCarousel";
import { isLightBackgroundColor } from "@/lib/theme";
import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";
import type { FilterItem } from "@/lib/types";

/** Explore Products filter item with optional Sanity image reference. */
type FilterCollection = FilterItem & {
  image?: { _ref?: string; asset?: { _ref?: string } };
};
type Category = { label?: string; collectionHandle?: string };

type ExploreProductsBlock = {
  backgroundColor?: string;
  hideWave?: boolean;
  title?: string;
  description?: string;
  filterCollections?: FilterCollection[];
  filterLabels?: string[];
  categories?: Category[];
};

const DEFAULT_TITLE = "EXPLORE OUR PRODUCTS";
const DEFAULT_DESCRIPTION =
  "Wild Alaskan seafood boxes, fillets, and specialty cuts ranging from sockeye and sablefish to halibut, cod, scallops, and even salmon heads are offered as premium, wild-caught options. All wild. All the time.";
const DEFAULT_FILTER_COLLECTIONS: FilterCollection[] = [
  { label: "Seafood", collectionHandle: "seafood" },
  { label: "Smoked & Specialty", collectionHandle: "smoked-specialty" },
  { label: "Pet Treats, Merch, Gift Cards", collectionHandle: "pet-treats" },
];

const LIGHT_TEXT_COLOR = "#1E1E1E";

export function ExploreProductsSection({
  block,
  hideExploreProductsWave = false,
  showTopWave = false,
  hasWaveAbove = false,
  bottomPadding,
  doubleTopPadding = false,
  tripleTitleTopMargin = false,
  carouselArrowColor,
}: {
  block: ExploreProductsBlock;
  /** When true, the wave under this section is hidden (e.g. page-level override). */
  hideExploreProductsWave?: boolean;
  /** When true, show the top wave above this section (e.g. on /story to match Our Crew → Explore transition). */
  showTopWave?: boolean;
  /** When true, section has no top padding so it sits right under the wave above (e.g. after Our Team with bottom wave). */
  hasWaveAbove?: boolean;
  /** Optional bottom padding CSS value (e.g. to match Chicagoland Farmers Markets on /story). */
  bottomPadding?: string;
  /** When true, use double the default top padding (e.g. on /wild-vs-farmed). */
  doubleTopPadding?: boolean;
  /** When true, use triple the top padding above the title (e.g. on /wild-vs-farmed). */
  tripleTitleTopMargin?: boolean;
  /** Optional carousel arrow color (e.g. #1E1E1E on /calendar page). */
  carouselArrowColor?: string;
}) {
  const title = block.title ?? DEFAULT_TITLE;
  const description = block.description ?? DEFAULT_DESCRIPTION;
  const isLightBg = isLightBackgroundColor(block.backgroundColor);
  const textTheme = isLightBg ? "light" : "dark";
  const showWave = !hideExploreProductsWave && !block.hideWave;

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
    const handle = f.collectionHandle?.trim();
    const href = handle
      ? `/shop?category=${encodeURIComponent(handle)}`
      : "/shop";
    let imageUrl: string | null = null;
    try {
      const img = urlFor(f.image);
      imageUrl = img ? img.url() : null;
    } catch {
      imageUrl = null;
    }
    return {
      label: f.label ?? "Shop",
      href,
      imageUrl,
      collectionHandle: (f.collectionHandle ?? "").trim().toLowerCase(),
    };
  });

  const noTopPadding = showTopWave || hasWaveAbove;
  return (
    <section
      id="shop"
      className={`relative z-20 overflow-visible pb-0 ${hasWaveAbove ? "-mt-px" : ""} ${noTopPadding ? "pt-0 md:pt-0" : doubleTopPadding ? "pt-12 md:pt-28" : "pt-12 md:pt-14"}`}
      style={{
        backgroundColor: block.backgroundColor ?? "#171730",
        ["--section-bg" as string]: block.backgroundColor ?? "#171730",
        ...(bottomPadding ? { paddingBottom: bottomPadding } : {}),
      }}
    >
      {showTopWave && (
        <div className="-mb-16 w-full shrink-0 overflow-visible md:-mb-8">
          <div
            className="wave-full-bleed shrink-0"
            style={{ transform: "scaleY(-1)" }}
          >
            <WaveDivider
              navySrc="/VectorWavyNavy.svg"
              wrapperClassName="-mb-px [transform:scaleX(-1)] bg-[#D4F2FF]"
            />
          </div>
        </div>
      )}
      <div
        className={`mx-auto w-full max-w-6xl px-6 md:px-4 ${hasWaveAbove ? (tripleTitleTopMargin ? "pt-[248px]" : "pt-8") : ""}`}
      >
        <SectionHeading
          title={title}
          description={description}
          variant="display"
          theme={textTheme}
          titleColor={isLightBg ? LIGHT_TEXT_COLOR : undefined}
          descriptionColor={isLightBg ? LIGHT_TEXT_COLOR : undefined}
          descriptionAsLead
          descriptionClassName="text-left text-xs font-semibold sm:text-center sm:text-base sm:font-normal md:text-xl"
        />
      </div>

      <ExploreProductsCategoryCarousel
        categories={categories}
        textTheme={textTheme}
        labelColor={isLightBg ? LIGHT_TEXT_COLOR : undefined}
        arrowColor={carouselArrowColor}
      />

      <div className="mt-8 flex w-full justify-center pb-10 md:hidden">
        <Link
          href={safeHref("/shop") ?? "#"}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 font-semibold hover:opacity-90"
          style={{
            color: isLightBg ? LIGHT_TEXT_COLOR : "#498CCB",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "1rem",
            lineHeight: "normal",
          }}
        >
          See more categories
          <img
            src="/Vector.svg"
            alt=""
            aria-hidden
            width={28.333}
            height={12.307}
            className="shrink-0 max-w-full h-auto"
          />
        </Link>
      </div>

      {showWave && (
        <div className="-mt-0 w-full shrink-0 overflow-visible">
          <div className="wave-full-bleed shrink-0">
            <WaveDivider
              navySrc="/VectorWavyNavy.svg"
              wrapperClassName="-mt-px [transform:scaleX(-1)] bg-[#D4F2FF]"
              navyOutline="bottom"
            />
          </div>
        </div>
      )}
    </section>
  );
}
