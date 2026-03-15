import { client, SITE_SETTINGS_QUERY } from "@/lib/sanity";
import { ShopPageClient } from "./ShopPageClient";
import type { CategorySectionBlockData } from "@/components/sections/CategorySectionBlock";

export const metadata = {
  title: "Shop | Hook Point",
  description: "Shop all wild Alaskan seafood, smoked & specialty, pet treats, merch, and gift cards.",
};

type SiteSettings = {
  promoBanner?: string | null;
  shopFilterOptions?: Array<{ label?: string; value?: string }> | null;
  shopPageCollectionSections?: Array<{
    title?: string | null;
    description?: string | null;
    collectionHandle?: string | null;
    layout?: "grid" | "carousel" | null;
    blendWhiteWithBackground?: boolean | null;
  }> | null;
};

export default async function ShopPage() {
  let promoBanner: string | null = null;
  let filterOptions: Array<{ value: string; label: string }> = [];
  let collectionSections: CategorySectionBlockData[] = [];

  if (client) {
    try {
      const settings = await client.fetch<SiteSettings | null>(
        SITE_SETTINGS_QUERY,
        {},
        { next: { revalidate: 60 } }
      );

      promoBanner = settings?.promoBanner ?? null;

      const rawFilters = settings?.shopFilterOptions ?? [];
      filterOptions = rawFilters
        .filter((f) => f?.label != null && f?.value != null)
        .map((f) => ({ label: String(f.label), value: String(f.value) }));

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
      filterOptions={filterOptions}
      collectionSections={collectionSections}
    />
  );
}
