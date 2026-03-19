import { client, SITE_SETTINGS_QUERY, CATCH_OF_THE_DAY_BLOCK_QUERY } from "@/lib/sanity";
import { getCollectionProductsForCarousel } from "@/lib/getCollectionProductsForCarousel";
import { getProductsByHandles } from "@/lib/getProductsByHandles";
import { ShopPageClient } from "./ShopPageClient";
import type { CategorySectionBlockData } from "@/components/sections/CategorySectionBlock";
import type { FilterItem } from "@/lib/types";
import type { ShopProductCarouselBlock } from "./ShopProductCarousel";

export const metadata = {
  title: "Shop | Hook Point",
  description: "Shop all wild Alaskan seafood, smoked & specialty, pet treats, merch, and gift cards.",
};

type SiteSettings = {
  promoBanner?: string | null;
  promoBannerUrl?: string | null;
  shopFilterOptions?: Array<{ label?: string; value?: string; insertAfterCategory?: string | null }> | null;
  shopPageCollectionSections?: Array<{
    title?: string | null;
    description?: string | null;
    collectionHandle?: string | null;
    layout?: "grid" | "carousel" | null;
    blendWhiteWithBackground?: boolean | null;
  }> | null;
};

type CatchOfTheDayBlockRaw = {
  backgroundColor?: string | null;
  title?: string | null;
  description?: string | null;
  productRefs?: Array<{ shopifyHandle?: string | null }> | null;
  filterCollections?: FilterItem[];
  cta?: { label?: string; href?: string } | null;
};

const DEFAULT_FILTER_COLLECTIONS: FilterItem[] = [
  { label: "Seafood", collectionHandle: "seafood" },
  { label: "Subscription Box", collectionHandle: "subscription-box" },
  { label: "Pet Treats, Merch, Gift Cards", collectionHandle: "pet-treats" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }> | { category?: string };
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams ?? {};
  const initialCategory = typeof params.category === "string" ? params.category.trim() : null;

  let promoBanner: string | null = null;
  let promoBannerUrl: string | null = null;
  let filterOptions: Array<{ value: string; label: string; insertAfterCategory?: string }> = [];
  let collectionSections: CategorySectionBlockData[] = [];
  let productCarouselBlock: ShopProductCarouselBlock | null = null;
  let productCarouselInitialProducts: Awaited<ReturnType<typeof getCollectionProductsForCarousel>> = [];

  if (client) {
    try {
      const [settings, catchData] = await Promise.all([
        client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY, {}, { next: { revalidate: 60 } }),
        client.fetch<CatchOfTheDayBlockRaw | null>(CATCH_OF_THE_DAY_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
      ]);

      promoBanner = settings?.promoBanner ?? null;
      promoBannerUrl = settings?.promoBannerUrl ?? null;

      if (catchData) {
        const productRefs = (catchData.productRefs ?? []).filter(
          (r) => typeof r?.shopifyHandle === "string" && r.shopifyHandle.trim() !== ""
        );
        const useSelectedProducts =
          productRefs.length >= 2 && productRefs.length <= 5;

        if (useSelectedProducts) {
          const handles = productRefs.map((r) => (r.shopifyHandle as string).trim());
          productCarouselInitialProducts = await getProductsByHandles(handles);
          productCarouselBlock = {
            backgroundColor: catchData.backgroundColor ?? undefined,
            title: catchData.title ?? undefined,
            description: catchData.description ?? undefined,
            filterCollections: [],
            selectedProductsMode: true,
          };
        } else {
          const filterCollections =
            catchData.filterCollections && catchData.filterCollections.length > 0
              ? catchData.filterCollections.filter((f) => f.label || f.collectionHandle)
              : DEFAULT_FILTER_COLLECTIONS;
          const firstHandle = filterCollections[0]?.collectionHandle?.trim() ?? "";
          productCarouselBlock = {
            backgroundColor: catchData.backgroundColor ?? undefined,
            title: catchData.title ?? undefined,
            description: catchData.description ?? undefined,
            filterCollections,
            selectedProductsMode: false,
          };
          if (firstHandle) {
            productCarouselInitialProducts = await getCollectionProductsForCarousel(firstHandle);
          }
        }
      }

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

  return (
    <ShopPageClient
      promoBanner={promoBanner}
      promoBannerUrl={promoBannerUrl}
      filterOptions={filterOptions}
      collectionSections={collectionSections}
      productCarouselBlock={productCarouselBlock}
      productCarouselInitialProducts={productCarouselInitialProducts}
      initialCategoryFromUrl={initialCategory}
    />
  );
}
