import * as React from "react";
import { Fragment, Suspense } from "react";
import { ShopSectionWave } from "@/app/shop/ShopSectionWave";
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

type PageSection =
  | { _type: "heroBlock"; _key?: string; [key: string]: unknown }
  | { _type: "catchOfTheDayBlock"; _key?: string; [key: string]: unknown }
  | { _type: "exploreProductsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "ourStoryBlock"; _key?: string; [key: string]: unknown }
  | { _type: "ourStoryExtendedBlock"; _key?: string; [key: string]: unknown }
  | { _type: "ourStoryExtendedReversedBlock"; _key?: string; [key: string]: unknown }
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
  | { _type: "whyWildMattersBlock"; _key?: string; [key: string]: unknown };

export function PageBuilder({
  sections,
  promoBanner,
  pageSlug,
  hideExploreProductsWave,
  hideLocalFoodsCoopsWave,
  hideOurStoryTitle,
  hideOurStoryCta,
  hideOurStoryWave,
  ourStoryVariant,
}: {
  sections?: PageSection[];
  promoBanner?: string | null;
  /** When "calendar", Upcoming Events section shows month filter (e.g. on /calendar page). */
  pageSlug?: string | null;
  /** When true, the wave under the Explore Products / Product Carousel section is hidden (e.g. on Collection pages). */
  hideExploreProductsWave?: boolean;
  /** When true, the wave below the Local Foods Co-ops section is hidden (e.g. on /story page only). */
  hideLocalFoodsCoopsWave?: boolean;
  /** When true, the Our Story section heading is hidden (e.g. on /story page only). */
  hideOurStoryTitle?: boolean;
  /** When true, the Our Story section CTA is hidden (e.g. on /story page only). */
  hideOurStoryCta?: boolean;
  /** When true, the wave below the Our Story section is hidden (e.g. on /story page only). */
  hideOurStoryWave?: boolean;
  /** "story-page" = dark bg + white text on /story only. */
  ourStoryVariant?: "default" | "story-page";
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
              />
            );
          case "catchOfTheDayBlock":
            return (
              <Suspense
                key={key}
                fallback={
                  <section
                    id="catch-of-the-day"
                    className="relative z-20 overflow-visible py-8 sm:py-10 lg:py-12"
                    style={{ backgroundColor: "var(--brand-navy)" }}
                  >
                    <div className="mx-auto w-full max-w-[1100px] px-4">
                      <div className="animate-pulse flex flex-col items-center gap-3">
                        <div className="h-8 w-48 max-w-full rounded bg-white/10" />
                        <div className="h-4 w-full max-w-[min(789px,100%)] rounded bg-white/10" />
                        <div className="h-4 w-full max-w-[min(789px,100%)] rounded bg-white/10" />
                      </div>
                    </div>
                    <div className="relative mt-4 sm:mt-6 lg:mt-8 flex items-center justify-center">
                      <div className="animate-pulse flex gap-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-[280px] h-[280px] max-w-full rounded-xl bg-white/10" style={{ minHeight: 280 }} />
                        ))}
                      </div>
                    </div>
                  </section>
                }
              >
                <CatchOfTheDaySection
                  block={block as Parameters<typeof CatchOfTheDaySection>[0]["block"]}
                />
              </Suspense>
            );
          case "exploreProductsBlock":
            return (
              <ExploreProductsSection
                key={key}
                block={block as Parameters<typeof ExploreProductsSection>[0]["block"]}
                hideExploreProductsWave={hideExploreProductsWave}
              />
            );
          case "ourStoryBlock":
            return (
              <OurStorySection
                key={key}
                block={block as Parameters<typeof OurStorySection>[0]["block"]}
                hideTitle={hideOurStoryTitle}
                hideCta={hideOurStoryCta}
                hideWave={hideOurStoryWave}
                variant={ourStoryVariant}
              />
            );
          case "ourStoryExtendedBlock":
            return (
              <OurStoryExtendedSection
                key={key}
                block={block as Parameters<typeof OurStoryExtendedSection>[0]["block"]}
              />
            );
          case "ourStoryExtendedReversedBlock":
            return (
              <OurStoryExtendedReversedSection
                key={key}
                block={block as Parameters<typeof OurStoryExtendedReversedSection>[0]["block"]}
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
                  block={block as Parameters<typeof PhotoGallerySection>[0]["block"]}
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
                  block={block as Parameters<typeof TeamBiosSection>[0]["block"]}
                  hasWaveAbove={!!prevIsPhotoGallery}
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
                block={block as Parameters<typeof DealPromotionsSection>[0]["block"]}
              />
            );
          case "reviewsBlock":
            return <ReviewsSection key={key} block={block as Parameters<typeof ReviewsSection>[0]["block"]} />;
          case "recipesBlock":
            return <RecipesSection key={key} block={block as Parameters<typeof RecipesSection>[0]["block"]} />;
          case "docksideMarketsBlock":
            return <DocksideMarketsSection key={key} block={block as Parameters<typeof DocksideMarketsSection>[0]["block"]} />;
          case "upcomingEventsBlock":
            return (
              <UpcomingEventsSection
                key={key}
                block={block as Parameters<typeof UpcomingEventsSection>[0]["block"]}
                pageSlug={pageSlug ?? undefined}
              />
            );
          case "localFoodsCoopsBlock":
            return (
              <LocalFoodsCoopsSection
                key={key}
                block={block as Parameters<typeof LocalFoodsCoopsSection>[0]["block"]}
                hideWave={hideLocalFoodsCoopsWave}
              />
            );
          case "faqBlock":
            return <FaqSection key={key} block={block as Parameters<typeof FaqSection>[0]["block"]} />;
          case "whyWildMattersBlock":
            return (
              <WhyWildMattersSection
                key={key}
                block={block as Parameters<typeof WhyWildMattersSection>[0]["block"]}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}