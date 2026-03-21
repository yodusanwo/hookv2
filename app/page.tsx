import { PageBuilder } from "@/components/sections/PageBuilder";
import { HomePageFallback } from "@/components/home/HomePageFallback";
import { getEventsFromSheet } from "@/lib/googleSheets";
import {
  client,
  HOMEPAGE_QUERY,
  SITE_SETTINGS_QUERY,
  EXPLORE_PRODUCTS_BLOCK_QUERY,
} from "@/lib/sanity";
import { shopifyFetch } from "@/lib/shopify";
import {
  SHOPIFY_HOME_PRODUCTS_QUERY,
  type ShopifyHomeProductsResponse,
} from "@/lib/shopifyHomeProductsQuery";

export default async function Home() {
  try {
    const hasSanity =
      !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      !!process.env.NEXT_PUBLIC_SANITY_DATASET;

    let sanityPage: { sections?: unknown[] } | null = null;
    let promoBanner: string | null = null;
    let promoBannerUrl: string | null = null;
    let canonicalExploreProductsBlock: Parameters<
      typeof PageBuilder
    >[0]["canonicalExploreProductsBlock"] = null;

    if (hasSanity) {
      try {
        const [homePage, settings, canonicalExplore] = await Promise.all([
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
        ]);
        sanityPage = homePage;
        promoBanner = settings?.promoBanner ?? null;
        promoBannerUrl = settings?.promoBannerUrl ?? null;
        canonicalExploreProductsBlock = canonicalExplore ?? null;
      } catch (e) {
        console.warn("Sanity fetch failed, using fallback:", e);
      }
    }

    if (sanityPage?.sections && Array.isArray(sanityPage.sections) && sanityPage.sections.length > 0) {
      const sheetEvents = await getEventsFromSheet();
      const sectionsWithEvents = sanityPage.sections.map((section: unknown) => {
        const s = section as { _type?: string; [key: string]: unknown };
        if (s._type === "upcomingEventsBlock") {
          return { ...s, events: sheetEvents, eventsLimit: 3 };
        }
        return section;
      });
      return (
        <main className="bg-white">
          <PageBuilder
            sections={sectionsWithEvents as Parameters<typeof PageBuilder>[0]["sections"]}
            promoBanner={promoBanner}
            promoBannerUrl={promoBannerUrl}
            canonicalExploreProductsBlock={canonicalExploreProductsBlock}
          />
        </main>
      );
    }

    const data = await shopifyFetch<ShopifyHomeProductsResponse>({
      query: SHOPIFY_HOME_PRODUCTS_QUERY,
      variables: { first: 12 },
      next: { revalidate: 60 },
    });

    return (
      <HomePageFallback
        products={data.products.edges}
        promoBanner={promoBanner}
        promoBannerUrl={promoBannerUrl}
      />
    );
  } catch (error) {
    console.error("Error fetching products:", error);
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
