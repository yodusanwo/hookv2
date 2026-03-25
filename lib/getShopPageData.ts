import "server-only";

import { client, CATCH_OF_THE_DAY_BLOCK_QUERY, SHOP_PAGE_SETTINGS_QUERY } from "@/lib/sanity";
import { getCollectionProductsForCarousel } from "@/lib/getCollectionProductsForCarousel";
import { getProductsByHandles } from "@/lib/getProductsByHandles";
import type { CategorySectionBlockData } from "@/components/sections/CategorySectionBlock";
import { resolveShopPathSegment } from "@/lib/shopPathSegment";
import type { FilterItem } from "@/lib/types";
import type { ShopProductCarouselBlock } from "@/app/shop/ShopProductCarousel";
import type { ApiProductForCarousel } from "@/lib/types";

const DEFAULT_FILTER_COLLECTIONS: FilterItem[] = [
  { label: "Seafood", collectionHandle: "seafood" },
  { label: "Subscription Box", collectionHandle: "subscription-box" },
  { label: "Pet Treats, Merch, Gift Cards", collectionHandle: "pet-treats" },
];

const GRID_FIRST = 50;
const CAROUSEL_FIRST = 24;

// #region agent log
function agentLogShop(
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string,
) {
  fetch("http://127.0.0.1:7629/ingest/9e235f25-64da-41ce-bdea-8ecf5d2d5b75", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8950d6",
    },
    body: JSON.stringify({
      sessionId: "8950d6",
      location: "getShopPageData.ts",
      message,
      data,
      timestamp: Date.now(),
      hypothesisId,
      runId: "pre-fix",
    }),
  }).catch(() => {});
}
// #endregion

type ShopPageSettingsRaw = {
  promoBanner?: string | null;
  promoBannerUrl?: string | null;
  shopFilterOptions?: Array<{
    label?: string | null;
    value?: string | null;
    insertAfterCategory?: string | null;
  }> | null;
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

export type ShopPageData = {
  promoBanner: string | null;
  promoBannerUrl: string | null;
  filterOptions: Array<{ value: string; label: string; insertAfterCategory?: string }>;
  collectionSections: CategorySectionBlockData[];
  productCarouselBlock: ShopProductCarouselBlock | null;
  productCarouselInitialProducts: ApiProductForCarousel[];
  /** Server-prefetched products per collection handle for category sections (avoids client waterfall). */
  initialSectionProductsByHandle: Record<string, ApiProductForCarousel[]>;
  /** When URL matches a collection handle (e.g. /shop/seafood). */
  initialCategoryFromUrl: string | null;
  /** When URL matches a product-type filter from shopFilterOptions (e.g. /shop/salmon). */
  initialFilterValuesFromUrl: string[];
};

export async function getShopPageData(
  searchParams?: Promise<{ category?: string }> | { category?: string },
  /** From `/shop/[category]` path segment; wins over `?category=` when both present. */
  pathCategory?: string | null,
): Promise<ShopPageData> {
  const params =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};
  const fromQuery =
    typeof params.category === "string" ? params.category.trim() : null;
  const trimmedPath = pathCategory?.trim() || null;
  const pathOrQuerySegment = (trimmedPath || fromQuery || "").trim();

  let promoBanner: string | null = null;
  let promoBannerUrl: string | null = null;
  let filterOptions: ShopPageData["filterOptions"] = [];
  let collectionSections: CategorySectionBlockData[] = [];
  let productCarouselBlock: ShopProductCarouselBlock | null = null;
  let productCarouselInitialProducts: ApiProductForCarousel[] = [];
  let initialSectionProductsByHandle: Record<string, ApiProductForCarousel[]> = {};

  // #region agent log
  const shopT0 = Date.now();
  agentLogShop(
    "getShopPageData start",
    { pathCategory: pathCategory ?? null, hasQueryCategory: Boolean(fromQuery) },
    "H3",
  );
  // #endregion

  if (!client) {
    return {
      promoBanner,
      promoBannerUrl,
      filterOptions,
      collectionSections,
      productCarouselBlock,
      productCarouselInitialProducts,
      initialSectionProductsByHandle,
      initialCategoryFromUrl: null,
      initialFilterValuesFromUrl: [],
    };
  }

  try {
    const [settings, catchData] = await Promise.all([
      client.fetch<ShopPageSettingsRaw | null>(SHOP_PAGE_SETTINGS_QUERY, {}, { next: { revalidate: 60 } }),
      client.fetch<CatchOfTheDayBlockRaw | null>(CATCH_OF_THE_DAY_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
    ]);

    // #region agent log
    agentLogShop(
      "sanity settings+catch parallel done",
      { elapsedMs: Date.now() - shopT0 },
      "H1",
    );
    // #endregion

    promoBanner = settings?.promoBanner ?? null;
    promoBannerUrl = settings?.promoBannerUrl ?? null;

    if (catchData) {
      const productRefs = (catchData.productRefs ?? []).filter(
        (r) => typeof r?.shopifyHandle === "string" && r.shopifyHandle.trim() !== "",
      );
      const useSelectedProducts = productRefs.length >= 2 && productRefs.length <= 5;

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

    // #region agent log
    agentLogShop(
      "carousel product batch done",
      {
        elapsedMs: Date.now() - shopT0,
        carouselMode: productCarouselBlock?.selectedProductsMode ? "by-handle" : "first-collection",
      },
      "H2",
    );
    // #endregion

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
      .map((s) => {
        const handle = String(s.collectionHandle).trim();
        const title = (s.title ?? s.collectionHandle ?? "").trim() || handle;
        const isGiftCard =
          handle.toLowerCase().includes("gift-card") ||
          title.toLowerCase().includes("gift card");
        const layout =
          s.layout === "carousel" || isGiftCard
            ? ("carousel" as const)
            : ("grid" as const);
        return {
          title,
          description: s.description ?? null,
          collectionHandle: handle,
          layout,
          blendWhiteWithBackground: Boolean(s?.blendWhiteWithBackground),
        };
      });

    const prefetchHandles = collectionSections.map((s) => ({
      handle: s.collectionHandle,
      first: s.layout === "carousel" ? CAROUSEL_FIRST : GRID_FIRST,
    }));

    if (prefetchHandles.length > 0) {
      const bundles = await Promise.all(
        prefetchHandles.map(({ handle, first }) =>
          getCollectionProductsForCarousel(handle, first).then((products) => ({
            handle,
            products,
          })),
        ),
      );
      initialSectionProductsByHandle = Object.fromEntries(
        bundles.map(({ handle, products }) => [handle, products]),
      );
    }

    // #region agent log
    agentLogShop(
      "section prefetch done",
      {
        elapsedMs: Date.now() - shopT0,
        sectionCount: prefetchHandles.length,
      },
      "H4",
    );
    // #endregion
  } catch (e) {
    console.warn("Shop page data fetch failed:", e);
  }

  let initialCategoryFromUrl: string | null = null;
  let initialFilterValuesFromUrl: string[] = [];
  if (pathOrQuerySegment) {
    const resolved = resolveShopPathSegment(
      pathOrQuerySegment,
      collectionSections,
      filterOptions,
    );
    if (resolved?.kind === "collection") {
      initialCategoryFromUrl = resolved.handle;
    } else if (resolved?.kind === "filter") {
      initialFilterValuesFromUrl = [resolved.value];
    }
  }

  // #region agent log
  agentLogShop(
    "getShopPageData return",
    { elapsedMs: Date.now() - shopT0, pathCategory: pathCategory ?? null },
    "H3",
  );
  // #endregion

  return {
    promoBanner,
    promoBannerUrl,
    filterOptions,
    collectionSections,
    productCarouselBlock,
    productCarouselInitialProducts,
    initialSectionProductsByHandle,
    initialCategoryFromUrl,
    initialFilterValuesFromUrl,
  };
}
