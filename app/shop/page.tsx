import { Suspense } from "react";
import { client, SITE_SETTINGS_QUERY, CATCH_OF_THE_DAY_BLOCK_QUERY } from "@/lib/sanity";
import { ShopPageClient } from "./ShopPageClient";
import { CatchOfTheDaySection } from "@/components/sections/CatchOfTheDaySection";
import type { CategorySectionBlockData } from "@/components/sections/CategorySectionBlock";
import type { FilterItem } from "@/lib/types";

export const metadata = {
  title: "Shop | Hook Point",
  description: "Shop all wild Alaskan seafood, smoked & specialty, pet treats, merch, and gift cards.",
};

type SiteSettings = {
  promoBanner?: string | null;
  shopFilterOptions?: Array<{ label?: string; value?: string; insertAfterCategory?: string | null }> | null;
  shopPageCollectionSections?: Array<{
    title?: string | null;
    description?: string | null;
    collectionHandle?: string | null;
    layout?: "grid" | "carousel" | null;
    blendWhiteWithBackground?: boolean | null;
  }> | null;
};

type CatchOfTheDayBlock = {
  backgroundColor?: string | null;
  title?: string | null;
  description?: string | null;
  filterCollections?: FilterItem[];
  cta?: { label?: string; href?: string } | null;
};

export default async function ShopPage() {
  let promoBanner: string | null = null;
  let filterOptions: Array<{ value: string; label: string; insertAfterCategory?: string }> = [];
  let collectionSections: CategorySectionBlockData[] = [];
  let catchBlock: CatchOfTheDayBlock | null = null;

  if (client) {
    try {
      const [settings, catchData] = await Promise.all([
        client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY, {}, { next: { revalidate: 60 } }),
        client.fetch<CatchOfTheDayBlock | null>(CATCH_OF_THE_DAY_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
      ]);

      promoBanner = settings?.promoBanner ?? null;
      catchBlock = catchData ?? null;

      const rawFilters = settings?.shopFilterOptions ?? [];
      filterOptions = rawFilters
        .filter((f) => f?.label != null && f?.value != null)
        .map((f) => ({
          label: String(f.label),
          value: String(f.value),
          insertAfterCategory: (f.insertAfterCategory ?? "").trim() || undefined,
        }));

      const rawSections = settings?.shopPageCollectionSections ?? [];
      collectionSections = rawSections
        .filter((s) => s?.collectionHandle)
        .map((s) => ({
          title: (s.title ?? s.collectionHandle ?? "").trim() || String(s.collectionHandle),
          description: s.description ?? null,
          collectionHandle: String(s.collectionHandle).trim(),
          layout: s.layout === "carousel" ? ("carousel" as const) : ("grid" as const),
          blendWhiteWithBackground: Boolean(s?.blendWhiteWithBackground),
        }));
    } catch (e) {
      console.warn("Shop page data fetch failed:", e);
    }
  }

  const productCarousel =
    catchBlock ? (
      <Suspense
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
        <CatchOfTheDaySection block={catchBlock} hideCollectionTabs />
      </Suspense>
    )
    : null;

  return (
    <ShopPageClient
      promoBanner={promoBanner}
      filterOptions={filterOptions}
      collectionSections={collectionSections}
      productCarousel={productCarousel}
    />
  );
}
