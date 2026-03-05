import * as React from "react";
import { Suspense } from "react";
import { HeroSection } from "./HeroSection";
import { CatchOfTheDaySection } from "./CatchOfTheDaySection";
import { ExploreProductsSection } from "./ExploreProductsSection";
import { OurStorySection } from "./OurStorySection";
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
  | { _type: "dealPromotionsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "reviewsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "recipesBlock"; _key?: string; [key: string]: unknown }
  | { _type: "docksideMarketsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "upcomingEventsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "localFoodsCoopsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "faqBlock"; _key?: string; [key: string]: unknown }
  | { _type: "whyWildMattersBlock"; _key?: string; [key: string]: unknown };

export function PageBuilder({ sections, promoBanner }: { sections?: PageSection[]; promoBanner?: string | null }) {
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
              />
            );
          case "ourStoryBlock":
            return (
              <OurStorySection
                key={key}
                block={block as Parameters<typeof OurStorySection>[0]["block"]}
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
            return <UpcomingEventsSection key={key} block={block as Parameters<typeof UpcomingEventsSection>[0]["block"]} />;
          case "localFoodsCoopsBlock":
            return <LocalFoodsCoopsSection key={key} block={block as Parameters<typeof LocalFoodsCoopsSection>[0]["block"]} />;
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