import * as React from "react";
import { HeroSection } from "./HeroSection";
import { ExploreProductsSection } from "./ExploreProductsSection";
import { WavesSection } from "./WavesSection";
import { OurStorySection } from "./OurStorySection";
import { DealPromotionsSection } from "./DealPromotionsSection";
import { ReviewsSection } from "./ReviewsSection";
import { RecipesSection } from "./RecipesSection";
import { DocksideMarketsSection } from "./DocksideMarketsSection";
import { UpcomingEventsSection } from "./UpcomingEventsSection";
import { LocalFoodsCoopsSection } from "./LocalFoodsCoopsSection";
import { FaqSection } from "./FaqSection";

type PageSection =
  | { _type: "heroBlock"; _key?: string; [key: string]: unknown }
  | { _type: "exploreProductsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "ourStoryBlock"; _key?: string; [key: string]: unknown }
  | { _type: "dealPromotionsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "reviewsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "recipesBlock"; _key?: string; [key: string]: unknown }
  | { _type: "docksideMarketsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "upcomingEventsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "localFoodsCoopsBlock"; _key?: string; [key: string]: unknown }
  | { _type: "faqBlock"; _key?: string; [key: string]: unknown };

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
          case "exploreProductsBlock":
            return (
              <React.Fragment key={key}>
                <ExploreProductsSection block={block as Parameters<typeof ExploreProductsSection>[0]["block"]} />
                <WavesSection />
              </React.Fragment>
            );
          case "ourStoryBlock":
            return <OurStorySection key={key} block={block as Parameters<typeof OurStorySection>[0]["block"]} />;
          case "dealPromotionsBlock":
            return <DealPromotionsSection key={key} block={block as Parameters<typeof DealPromotionsSection>[0]["block"]} />;
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
          default:
            return null;
        }
      })}
    </>
  );
}
