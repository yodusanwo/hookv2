/**
 * Home page (`/`) — server component.
 *
 * Two render paths:
 * 1. Sanity CMS — `HOMEPAGE_QUERY` returns page sections; rendered via `PageBuilder`.
 *    Requires `NEXT_PUBLIC_SANITY_PROJECT_ID` + `NEXT_PUBLIC_SANITY_DATASET`.
 * 2. Fallback — if Sanity is off or the homepage doc has no sections, we fetch a fixed
 *    Shopify product list and render `HomePageFallback` (static hero + hard-coded copy).
 *
 * Cross-cutting:
 * - `upcomingEventsBlock` sections get `events` from Google Sheets (`getEventsFromSheet`)
 *   and `eventsLimit: 3` injected here (Studio does not store sheet rows).
 * - `HeroImagePreload` injects `<link rel="preload">` for LCP; URL comes from the first
 *   hero image in Sanity sections, or a constant for the fallback path.
 * - Promo banner text/link come from `SITE_SETTINGS_QUERY` when Sanity is available.
 *
 * Queries use `revalidate: 60` (ISR-ish caching). Sheet fetch uses its own revalidation
 * inside `lib/googleSheets.ts`.
 */
import { PageBuilder } from "@/components/sections/PageBuilder";
import { HomePageFallback } from "@/components/home/HomePageFallback";
import { getEventsFromSheet } from "@/lib/googleSheets";
import {
  client,
  HOMEPAGE_QUERY,
  SITE_SETTINGS_QUERY,
  EXPLORE_PRODUCTS_BLOCK_QUERY,
  HOMEPAGE_DOCKSIDE_MARKETS_BLOCK_QUERY,
} from "@/lib/sanity";
import { fetchHomeFallbackProducts } from "@/lib/fetchHomeFallbackProducts";
import { HeroImagePreload } from "@/app/components/HeroImagePreload";
import {
  FALLBACK_HOME_HERO_PRELOAD_URL,
  getFirstHeroImagePreloadUrlFromSections,
} from "@/lib/homeHeroPreloadUrl";

export default async function Home() {
  try {
    // Gate Sanity: without project + dataset, we skip fetches and go straight to fallback.
    const hasSanity =
      !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      !!process.env.NEXT_PUBLIC_SANITY_DATASET;

    let sanityPage: { sections?: unknown[] } | null = null;
    let promoBanner: string | null = null;
    let promoBannerUrl: string | null = null;
    let canonicalExploreProductsBlock: Parameters<
      typeof PageBuilder
    >[0]["canonicalExploreProductsBlock"] = null;
    let canonicalDocksideMarketsBlock: Parameters<
      typeof PageBuilder
    >[0]["canonicalDocksideMarketsBlock"] = null;

    if (hasSanity) {
      try {
        // Homepage document, promo, shared Explore + Dockside blocks (merged on other routes via PageBuilder).
        const [homePage, settings, canonicalExplore, canonicalDockside] =
          await Promise.all([
            client.fetch<{ sections?: unknown[] } | null>(HOMEPAGE_QUERY, {}, { next: { revalidate: 60 } }),
            client.fetch<{ promoBanner?: string; promoBannerUrl?: string } | null>(
              SITE_SETTINGS_QUERY,
              {},
              { next: { revalidate: 60 } },
            ),
            client.fetch<Parameters<typeof PageBuilder>[0]["canonicalExploreProductsBlock"]>(
              EXPLORE_PRODUCTS_BLOCK_QUERY,
              {},
              { next: { revalidate: 60 } },
            ),
            client.fetch<Parameters<typeof PageBuilder>[0]["canonicalDocksideMarketsBlock"]>(
              HOMEPAGE_DOCKSIDE_MARKETS_BLOCK_QUERY,
              {},
              { next: { revalidate: 60 } },
            ),
          ]);
        sanityPage = homePage;
        promoBanner = settings?.promoBanner ?? null;
        promoBannerUrl = settings?.promoBannerUrl ?? null;
        canonicalExploreProductsBlock = canonicalExplore ?? null;
        canonicalDocksideMarketsBlock = canonicalDockside ?? null;
      } catch (e) {
        console.warn("Sanity fetch failed, using fallback:", e);
      }
    }

    // Primary path: CMS-driven layout (see `sanity/schema` / Studio for block types).
    if (sanityPage?.sections && Array.isArray(sanityPage.sections) && sanityPage.sections.length > 0) {
      const sheetEvents = await getEventsFromSheet();
      // Upcoming Events block expects `events` at runtime; sheet is the source of truth.
      const sectionsWithEvents = sanityPage.sections.map((section: unknown) => {
        const s = section as { _type?: string; [key: string]: unknown };
        if (s._type === "upcomingEventsBlock") {
          return { ...s, events: sheetEvents, eventsLimit: 3 };
        }
        return section;
      });
      const heroPreloadUrl =
        getFirstHeroImagePreloadUrlFromSections(sectionsWithEvents);
      return (
        <>
          <HeroImagePreload href={heroPreloadUrl} />
        <main className="bg-white">
          <PageBuilder
            sections={sectionsWithEvents as Parameters<typeof PageBuilder>[0]["sections"]}
            promoBanner={promoBanner}
            promoBannerUrl={promoBannerUrl}
            canonicalExploreProductsBlock={canonicalExploreProductsBlock}
            canonicalDocksideMarketsBlock={canonicalDocksideMarketsBlock}
          />
        </main>
        </>
      );
    }

    // Fallback path: no Sanity homepage content — static marketing shell + live Shopify products.
    const data = await fetchHomeFallbackProducts();

    return (
      <>
        <HeroImagePreload href={FALLBACK_HOME_HERO_PRELOAD_URL} />
        <HomePageFallback
          products={data.products.edges}
          promoBanner={promoBanner}
          promoBannerUrl={promoBannerUrl}
        />
      </>
    );
  } catch (error) {
    // Sanity/sheet or other unexpected failures (Shopify fallback is non-throwing — see `fetchHomeFallbackProducts`).
    console.error("Home page error:", error);
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-red-600">
            Error Loading Products
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-card p-6">
            <p className="text-red-800 font-mono">
              {error instanceof Error
                ? error.message
                : "Unknown error occurred"}
            </p>
          </div>
        </div>
      </main>
    );
  }
}
