import { PageBuilder } from "@/components/sections/PageBuilder";
import { FaqSection } from "@/components/sections/FaqSection";
import {
  client,
  FAQ_PAGE_QUERY,
  HOMEPAGE_FAQ_BLOCK_QUERY,
  EXPLORE_PRODUCTS_BLOCK_QUERY,
  HOMEPAGE_DOCKSIDE_MARKETS_BLOCK_QUERY,
  HOMEPAGE_LOCAL_FOODS_COOPS_BLOCK_QUERY,
} from "@/lib/sanity";
import { getEventsFromSheet } from "@/lib/googleSheets";

export const metadata = {
  title: "FAQ | Hook Point",
  description:
    "Answers about Hook Point’s wild Alaska seafood: sourcing, portion & box sizes, shipping nationwide, thawing & storage, subscriptions & ordering.",
};

const FALLBACK_FAQ_BLOCK = {
  title: "FAQ",
  description: "",
  faqs: [
    {
      question: "Where do you source your fish?",
      answer:
        "We source wild-caught salmon and seafood directly from Alaska's small-boat fleet, primarily from the waters off Kodiak Island.",
    },
    {
      question: "How can I order?",
      answer:
        "You can order through our online shop or find us at Chicagoland farmers markets. Check our Events section for market schedules.",
    },
  ],
};

export default async function FaqPage() {
  const hasSanity =
    !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    !!process.env.NEXT_PUBLIC_SANITY_DATASET;

  if (!hasSanity || !client) {
    return (
      <main className="bg-white pt-[176px] md:pt-[208px]">
        <FaqSection block={FALLBACK_FAQ_BLOCK} />
      </main>
    );
  }

  try {
    const [
      sanityPage,
      canonicalExploreProductsBlock,
      homeFaqBlock,
      canonicalDocksideMarketsBlock,
      canonicalLocalFoodsCoopsBlock,
    ] = await Promise.all([
      client.fetch<{ title?: string; sections?: unknown[] } | null>(
        FAQ_PAGE_QUERY,
        {},
        { next: { revalidate: 60 } },
      ),
      client.fetch<
        Parameters<typeof PageBuilder>[0]["canonicalExploreProductsBlock"]
      >(EXPLORE_PRODUCTS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
      client.fetch<Parameters<typeof FaqSection>[0]["block"] | null>(
        HOMEPAGE_FAQ_BLOCK_QUERY,
        {},
        { next: { revalidate: 60 } },
      ),
      client.fetch<
        Parameters<typeof PageBuilder>[0]["canonicalDocksideMarketsBlock"]
      >(HOMEPAGE_DOCKSIDE_MARKETS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
      client.fetch<
        Parameters<typeof PageBuilder>[0]["canonicalLocalFoodsCoopsBlock"]
      >(HOMEPAGE_LOCAL_FOODS_COOPS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
    ]);

    if (
      sanityPage?.sections &&
      Array.isArray(sanityPage.sections) &&
      sanityPage.sections.length > 0
    ) {
      const sheetEvents = await getEventsFromSheet();
      const sectionsWithEvents = sanityPage.sections.map((section: unknown) => {
        const s = section as { _type?: string; [key: string]: unknown };
        if (s._type === "upcomingEventsBlock") {
          return { ...s, events: sheetEvents };
        }
        return section;
      });

      const firstSection = sectionsWithEvents[0];
      const firstBg =
        firstSection &&
        typeof firstSection === "object" &&
        "backgroundColor" in firstSection &&
        typeof (firstSection as { backgroundColor?: string }).backgroundColor ===
          "string"
          ? (firstSection as { backgroundColor: string }).backgroundColor
          : "#ffffff";

      return (
        <main
          className="pt-[176px] md:pt-[208px]"
          style={{ backgroundColor: firstBg }}
        >
          <PageBuilder
            sections={
              sectionsWithEvents as Parameters<
                typeof PageBuilder
              >[0]["sections"]
            }
            promoBanner={null}
            pageSlug="faq"
            canonicalExploreProductsBlock={canonicalExploreProductsBlock}
            canonicalDocksideMarketsBlock={canonicalDocksideMarketsBlock}
            canonicalLocalFoodsCoopsBlock={canonicalLocalFoodsCoopsBlock}
          />
        </main>
      );
    }

    const faqs = homeFaqBlock?.faqs;
    if (Array.isArray(faqs) && faqs.length > 0) {
      return (
        <main className="bg-white pt-[176px] md:pt-[208px]">
          <FaqSection
            block={{ ...homeFaqBlock, showMoreUrl: undefined }}
          />
        </main>
      );
    }
  } catch {
    // Use fallback below
  }

  return (
    <main className="bg-white pt-[176px] md:pt-[208px]">
      <FaqSection block={FALLBACK_FAQ_BLOCK} />
    </main>
  );
}
