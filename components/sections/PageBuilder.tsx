import * as React from "react";
import { Fragment, Suspense } from "react";
import { ShopSectionWave } from "@/app/shop/ShopSectionWave";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { HeroSection } from "./HeroSection";
import { CatchOfTheDaySection } from "./CatchOfTheDaySection";
import { ExploreProductsSection } from "./ExploreProductsSection";
import { OurStorySection } from "./OurStorySection";
import { OurStoryExtendedSection } from "./OurStoryExtendedSection";
import { OurStoryExtendedReversedSection } from "./OurStoryExtendedReversedSection";
import { PhotoGallerySection } from "./PhotoGallerySection";
import { TeamBiosSection } from "./TeamBiosSection";
import { ContactSection } from "./ContactSection";
import { DealPromotionsSection } from "./DealPromotionsSection";
import { ReviewsSection } from "./ReviewsSection";
import { RecipesSection } from "./RecipesSection";
import { DocksideMarketsSection } from "./DocksideMarketsSection";
import { UpcomingEventsSection } from "./UpcomingEventsSection";
import { LocalFoodsCoopsSection } from "./LocalFoodsCoopsSection";
import { FaqSection } from "./FaqSection";
import { WhyWildMattersSection } from "./WhyWildMattersSection";
import { TheBasicsSection } from "./TheBasicsSection";

type PageSection =
  | { _type: "heroBlock"; _key?: string; [key: string]: unknown }
  | { _type: "catchOfTheDayBlock"; _key?: string; [key: string]: unknown }
  | { _type: "exploreProductsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "ourStoryBlock"; _key?: string; [key: string]: unknown }
  | { _type: "ourStoryExtendedBlock"; _key?: string; [key: string]: unknown }
  | {
      _type: "ourStoryExtendedReversedBlock";
      _key?: string;
      [key: string]: unknown;
    }
  | { _type: "photoGalleryBlock"; _key?: string; [key: string]: unknown }
  | { _type: "teamBiosBlock"; _key?: string; [key: string]: unknown }
  | { _type: "contactBlock"; _key?: string; [key: string]: unknown }
  | { _type: "dealPromotionsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "reviewsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "recipesBlock"; _key?: string; [key: string]: unknown }
  | { _type: "docksideMarketsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "upcomingEventsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "localFoodsCoopsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "faqBlock"; _key?: string; [key: string]: unknown }
  | { _type: "whyWildMattersBlock"; _key?: string; [key: string]: unknown }
  | { _type: "theBasicsSectionBlock"; _key?: string; [key: string]: unknown };

/** Home page Explore Products block shape; when provided, any exploreProductsBlock on this page uses this content (title, description, categories, images, links) so only the home page needs to be edited in Sanity. */
export type CanonicalExploreProductsBlock = {
  _type?: string;
  _key?: string;
  title?: string | null;
  description?: string | null;
  backgroundColor?: string | null;
  hideWave?: boolean | null;
  filterCollections?: Array<{
    label?: string | null;
    collectionHandle?: string | null;
    image?: { _ref?: string; asset?: { _ref?: string } };
  }> | null;
  [key: string]: unknown;
};

export function PageBuilder({
  sections,
  promoBanner,
  pageSlug,
  hideExploreProductsWave,
  showExploreProductsTopWave,
  exploreProductsBottomPadding,
  docksideMarketsTopPadding,
  docksideMarketsBottomPadding,
  docksideMarketsMinHeight,
  hideLocalFoodsCoopsWave,
  localFoodsCoopsBottomPaddingClass,
  hideOurStoryTitle,
  hideOurStoryCta,
  hideOurStoryWave,
  ourStoryVariant,
  canonicalExploreProductsBlock,
  promoBannerUrl,
}: {
  sections?: PageSection[];
  promoBanner?: string | null;
  promoBannerUrl?: string | null;
  /** When "calendar", Upcoming Events section shows month filter (e.g. on /calendar page). */
  pageSlug?: string | null;
  /** When true, the wave under the Explore Products / Product Carousel section is hidden (e.g. on Collection pages). */
  hideExploreProductsWave?: boolean;
  /** When true, show the top wave above the Explore Our Products section (e.g. on /story to match Our Crew → Explore transition). */
  showExploreProductsTopWave?: boolean;
  /** Optional bottom padding CSS value for Explore Our Products (e.g. to match Chicagoland Farmers Markets on /story). */
  exploreProductsBottomPadding?: string;
  /** Optional top padding CSS value for Chicagoland Farmers Markets (e.g. reduced on /story). */
  docksideMarketsTopPadding?: string;
  /** Optional bottom padding CSS value for Chicagoland Farmers Markets (e.g. reduced on /story). */
  docksideMarketsBottomPadding?: string;
  /** Optional min-height in px for Chicagoland Farmers Markets (e.g. 331 on /story to reduce bottom space by half). */
  docksideMarketsMinHeight?: number;
  /** When true, the wave below the Local Foods Co-ops section is hidden (e.g. on /story page only). */
  hideLocalFoodsCoopsWave?: boolean;
  /** Optional bottom padding class for Featured Local Stores section (e.g. pb-10 on /story). */
  localFoodsCoopsBottomPaddingClass?: string;
  /** When true, the Our Story section heading is hidden (e.g. on /story page only). */
  hideOurStoryTitle?: boolean;
  /** When true, the Our Story section CTA is hidden (e.g. on /story page only). */
  hideOurStoryCta?: boolean;
  /** When true, the wave below the Our Story section is hidden (e.g. on /story page only). */
  hideOurStoryWave?: boolean;
  /** "story-page" = dark bg + white text on /story only. */
  ourStoryVariant?: "default" | "story-page";
  /** When set, any Explore Our Products block on this page uses this content (from home page) so description, categories, images and /shop links match the home page. Page-level block can still override backgroundColor and hideWave. */
  canonicalExploreProductsBlock?: CanonicalExploreProductsBlock | null;
}) {
  const items = sections ?? [];

  return (
    <>
      {items.map((block, idx) => {
        const key = block._key ?? `section-${idx}`;
        switch (block._type) {
          case "heroBlock":
            return (
              <HeroSection
                key={key}
                block={block as Parameters<typeof HeroSection>[0]["block"]}
                promoBanner={promoBanner}
                promoBannerUrl={promoBannerUrl}
              />
            );
          case "catchOfTheDayBlock":
            return (
              <Suspense
                key={key}
                fallback={
                  <section
                    id="catch-of-the-day"
                    className="relative z-20 overflow-visible py-12 sm:py-10 lg:py-12"
                    style={{ backgroundColor: "var(--brand-navy)" }}
                  >
                    <div className="mx-auto w-full max-w-6xl px-6 md:px-4">
                      <div className="animate-pulse flex flex-col items-center gap-3">
                        <div className="h-8 w-48 max-w-full rounded bg-white/10" />
                        <div className="h-4 w-full max-w-[min(789px,100%)] rounded bg-white/10" />
                        <div className="h-4 w-full max-w-[min(789px,100%)] rounded bg-white/10" />
                      </div>
                    </div>
                    <div className="relative mt-4 sm:mt-6 lg:mt-8 flex items-center justify-center">
                      <div className="animate-pulse flex gap-6">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-[280px] h-[280px] max-w-full rounded-xl bg-white/10"
                            style={{ minHeight: 280 }}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                }
              >
                <CatchOfTheDaySection
                  block={
                    block as Parameters<typeof CatchOfTheDaySection>[0]["block"]
                  }
                />
              </Suspense>
            );
          case "exploreProductsBlock": {
            const prevBlock = idx > 0 ? items[idx - 1] : null;
            const prevIsTeamBios = prevBlock?._type === "teamBiosBlock";
            const prevIsOurStoryExtended =
              prevBlock &&
              (prevBlock._type === "ourStoryExtendedBlock" ||
                prevBlock._type === "ourStoryExtendedReversedBlock");
            const prevIsSecondOurStoryExtended =
              pageSlug === "wild" &&
              prevBlock?._type === "ourStoryExtendedBlock" &&
              items
                .slice(0, idx)
                .filter((b) => b._type === "ourStoryExtendedBlock").length ===
                2;
            const teamBiosShowsBottomWave = ourStoryVariant === "story-page";
            const ourStoryExtendedShowsWave = false;
            const hasWaveAbove =
              (prevIsTeamBios && teamBiosShowsBottomWave) ||
              (!!prevIsOurStoryExtended && ourStoryExtendedShowsWave) ||
              prevIsSecondOurStoryExtended;
            // Use home page content (description, categories, images, /shop links) when provided; page block can override backgroundColor and hideWave.
            const pageBlock = block as {
              backgroundColor?: string;
              hideWave?: boolean;
              [key: string]: unknown;
            };
            const exploreBlock = canonicalExploreProductsBlock
              ? {
                  ...canonicalExploreProductsBlock,
                  backgroundColor:
                    pageBlock.backgroundColor ??
                    canonicalExploreProductsBlock.backgroundColor,
                  hideWave:
                    pageBlock.hideWave ??
                    canonicalExploreProductsBlock.hideWave,
                }
              : pageBlock;
            const wildWave = prevIsSecondOurStoryExtended ? (
              <div
                className="relative z-30 top-[60px] -mt-12 -mb-2 w-full shrink-0 md:top-[100px] md:-mt-8"
                style={{
                  transform: "scaleX(1.10) rotate(-5deg) translateZ(0)",
                }}
              >
                <WaveDivider
                  navySrc="/VectorWavyNavyOurStory.svg"
                  wrapperClassName="mt-3 -mb-px [background-color:transparent]"
                  navyOutline="top"
                />
                <WaveDivider
                  navySrc="/VectorWavyNavy.svg"
                  wrapperClassName="-mt-px [background-color:transparent]"
                  navyOutline="bottom"
                />
              </div>
            ) : null;
            return (
              <Fragment key={key}>
                {wildWave}
                <ExploreProductsSection
                  block={
                    exploreBlock as Parameters<
                      typeof ExploreProductsSection
                    >[0]["block"]
                  }
                  hideExploreProductsWave={hideExploreProductsWave}
                  showTopWave={showExploreProductsTopWave}
                  hasWaveAbove={hasWaveAbove}
                  bottomPadding={exploreProductsBottomPadding}
                  doubleTopPadding={pageSlug === "wild"}
                  tripleTitleTopMargin={pageSlug === "wild"}
                  carouselArrowColor={pageSlug === "calendar" ? "#1E1E1E" : undefined}
                />
              </Fragment>
            );
          }
          case "ourStoryBlock":
            return (
              <OurStorySection
                key={key}
                block={block as Parameters<typeof OurStorySection>[0]["block"]}
                hideTitle={hideOurStoryTitle}
                hideCta={hideOurStoryCta}
                hideWave={hideOurStoryWave || pageSlug === "wild"}
                variant={ourStoryVariant}
              />
            );
          case "ourStoryExtendedBlock":
            return (
              <OurStoryExtendedSection
                key={key}
                block={
                  block as Parameters<
                    typeof OurStoryExtendedSection
                  >[0]["block"]
                }
              />
            );
          case "ourStoryExtendedReversedBlock":
            return (
              <OurStoryExtendedReversedSection
                key={key}
                block={
                  block as Parameters<
                    typeof OurStoryExtendedReversedSection
                  >[0]["block"]
                }
              />
            );
          case "photoGalleryBlock": {
            const prevBlock = idx > 0 ? items[idx - 1] : null;
            const prevIsOurStoryExtended =
              prevBlock &&
              (prevBlock._type === "ourStoryExtendedBlock" ||
                prevBlock._type === "ourStoryExtendedReversedBlock");
            return (
              <Fragment key={key}>
                {prevIsOurStoryExtended && <ShopSectionWave />}
                <PhotoGallerySection
                  block={
                    block as Parameters<typeof PhotoGallerySection>[0]["block"]
                  }
                  hasWaveAbove={!!prevIsOurStoryExtended}
                />
              </Fragment>
            );
          }
          case "teamBiosBlock": {
            const prevBlock = idx > 0 ? items[idx - 1] : null;
            const prevIsPhotoGallery = prevBlock?._type === "photoGalleryBlock";
            return (
              <Fragment key={key}>
                {prevIsPhotoGallery && <ShopSectionWave />}
                <TeamBiosSection
                  block={
                    block as Parameters<typeof TeamBiosSection>[0]["block"]
                  }
                  hasWaveAbove={!!prevIsPhotoGallery}
                  showBottomWave={ourStoryVariant === "story-page"}
                />
              </Fragment>
            );
          }
          case "contactBlock":
            return (
              <ContactSection
                key={key}
                block={block as Parameters<typeof ContactSection>[0]["block"]}
              />
            );
          case "dealPromotionsBlock":
            return (
              <DealPromotionsSection
                key={key}
                sectionId="deals"
                block={
                  block as Parameters<typeof DealPromotionsSection>[0]["block"]
                }
              />
            );
          case "reviewsBlock":
            return (
              <ReviewsSection
                key={key}
                block={block as Parameters<typeof ReviewsSection>[0]["block"]}
              />
            );
          case "recipesBlock":
            return (
              <RecipesSection
                key={key}
                block={block as Parameters<typeof RecipesSection>[0]["block"]}
              />
            );
          case "docksideMarketsBlock": {
            const calendarReduced = "clamp(3rem, 6vw, 5rem)";
            const calendarTop = "calc(clamp(3rem, 6vw, 5rem) - 90px)";
            const docksideTop =
              docksideMarketsTopPadding ??
              (pageSlug === "calendar" ? calendarTop : undefined);
            const docksideBottom =
              docksideMarketsBottomPadding ??
              (pageSlug === "calendar" ? calendarReduced : undefined);
            const docksideMinHeight =
              docksideMarketsMinHeight ??
              (pageSlug === "calendar" ? 331 : undefined);
            return (
              <DocksideMarketsSection
                key={key}
                block={
                  block as Parameters<typeof DocksideMarketsSection>[0]["block"]
                }
                topPadding={docksideTop}
                bottomPadding={docksideBottom}
                minHeight={docksideMinHeight}
                arrowColor={pageSlug === "calendar" ? "#1E1E1E" : undefined}
              />
            );
          }
          case "upcomingEventsBlock":
            return (
              <UpcomingEventsSection
                key={key}
                block={
                  block as Parameters<typeof UpcomingEventsSection>[0]["block"]
                }
                pageSlug={pageSlug ?? undefined}
              />
            );
          case "localFoodsCoopsBlock":
            return (
              <LocalFoodsCoopsSection
                key={key}
                block={
                  block as Parameters<typeof LocalFoodsCoopsSection>[0]["block"]
                }
                hideWave={hideLocalFoodsCoopsWave}
                bottomPaddingClass={localFoodsCoopsBottomPaddingClass}
              />
            );
          case "faqBlock":
            return (
              <FaqSection
                key={key}
                block={block as Parameters<typeof FaqSection>[0]["block"]}
              />
            );
          case "whyWildMattersBlock":
            return (
              <WhyWildMattersSection
                key={key}
                block={
                  block as Parameters<typeof WhyWildMattersSection>[0]["block"]
                }
              />
            );
          case "theBasicsSectionBlock":
            return (
              <TheBasicsSection
                key={key}
                block={block as Parameters<typeof TheBasicsSection>[0]["block"]}
                topPadding={pageSlug === "recipes" ? 120 : undefined}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
