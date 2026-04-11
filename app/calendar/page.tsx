import { PageBuilder } from "@/components/sections/PageBuilder";
import { UpcomingEventsSection } from "@/components/sections/UpcomingEventsSection";
import {
  client,
  PAGE_BY_SLUG_QUERY,
  HOMEPAGE_UPCOMING_EVENTS_BLOCK_QUERY,
  EXPLORE_PRODUCTS_BLOCK_QUERY,
  HOMEPAGE_DOCKSIDE_MARKETS_BLOCK_QUERY,
  HOMEPAGE_LOCAL_FOODS_COOPS_BLOCK_QUERY,
} from "@/lib/sanity";
import { getEventsFromSheet } from "@/lib/googleSheets";

export const metadata = {
  title: "Calendar | Hook Point",
  description:
    "Chicagoland farmers markets & events where Hook Point sells fresh wild Alaska seafood—dates, times & locations.",
};

export default async function CalendarPage() {
  const sheetEvents = await getEventsFromSheet();

  const hasSanity =
    !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    !!process.env.NEXT_PUBLIC_SANITY_DATASET;

  if (!hasSanity || !client) {
    return (
      <main className="bg-white pt-[176px] md:pt-[208px]">
        <UpcomingEventsSection
          block={{
            title: "UPCOMING EVENTS",
            description: "",
            events: sheetEvents,
          }}
          pageSlug="calendar"
        />
      </main>
    );
  }

  try {
    const [
      sanityPage,
      canonicalExploreProductsBlock,
      canonicalDocksideMarketsBlock,
      canonicalLocalFoodsCoopsBlock,
      homeEventsBlock,
    ] = await Promise.all([
      client.fetch<{ title?: string; sections?: unknown[] } | null>(
        PAGE_BY_SLUG_QUERY,
        { slug: "calendar" },
        { next: { revalidate: 60 } },
      ),
      client.fetch<
        Parameters<typeof PageBuilder>[0]["canonicalExploreProductsBlock"]
      >(EXPLORE_PRODUCTS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
      client.fetch<
        Parameters<typeof PageBuilder>[0]["canonicalDocksideMarketsBlock"]
      >(HOMEPAGE_DOCKSIDE_MARKETS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
      client.fetch<
        Parameters<typeof PageBuilder>[0]["canonicalLocalFoodsCoopsBlock"]
      >(HOMEPAGE_LOCAL_FOODS_COOPS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
      client.fetch<Record<string, unknown> | null>(
        HOMEPAGE_UPCOMING_EVENTS_BLOCK_QUERY,
        {},
        { next: { revalidate: 60 } },
      ),
    ]);

    if (
      sanityPage?.sections &&
      Array.isArray(sanityPage.sections) &&
      sanityPage.sections.length > 0
    ) {
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
            pageSlug="calendar"
            canonicalExploreProductsBlock={canonicalExploreProductsBlock}
            canonicalDocksideMarketsBlock={canonicalDocksideMarketsBlock}
            canonicalLocalFoodsCoopsBlock={canonicalLocalFoodsCoopsBlock}
          />
        </main>
      );
    }

    const block = homeEventsBlock
      ? { ...homeEventsBlock, events: sheetEvents }
      : {
          title: "UPCOMING EVENTS",
          description: "",
          events: sheetEvents,
        };

    return (
      <main className="bg-white pt-[176px] md:pt-[208px]">
        <UpcomingEventsSection
          block={
            block as Parameters<typeof UpcomingEventsSection>[0]["block"]
          }
          pageSlug="calendar"
        />
      </main>
    );
  } catch {
    return (
      <main className="bg-white pt-[176px] md:pt-[208px]">
        <UpcomingEventsSection
          block={{
            title: "UPCOMING EVENTS",
            description: "",
            events: sheetEvents,
          }}
          pageSlug="calendar"
        />
      </main>
    );
  }
}
