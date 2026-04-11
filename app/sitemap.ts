import type { MetadataRoute } from "next";
import { shopifyFetch } from "@/lib/shopify";
import { client, SHOP_PAGE_SETTINGS_QUERY } from "@/lib/sanity";
import { shopPathSegmentFromValue } from "@/lib/shopPathSegment";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://hookv2.vercel.app");

/** Matches `RESERVED_SLUGS` in `app/[slug]/page.tsx` — do not emit `/[slug]` for these. */
/**
 * Shopify products that still exist as duplicate/draft handles but should not be indexed;
 * canonical URL is handled in middleware.
 */
const EXCLUDE_PRODUCT_HANDLES_FROM_SITEMAP = new Set([
  "wild-cuts-pet-treats-5-pack-copy",
]);

const RESERVED_PAGE_SLUGS = new Set([
  "contact",
  "about",
  "story",
  "home",
  "shop",
  "recipes",
  "basics",
  "faq",
  "calendar",
  "collections",
  "cart",
  "products",
  "studio",
]);

const PRODUCT_HANDLES_QUERY = `
  query ProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges { node { handle } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

type ProductHandlesQueryData = {
  products: {
    edges: Array<{ node: { handle: string } }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

async function getAllProductHandles(): Promise<string[]> {
  const handles: string[] = [];
  let after: string | null = null;
  const first = 250;
  try {
    for (;;) {
      const data: ProductHandlesQueryData = await shopifyFetch<ProductHandlesQueryData>({
        query: PRODUCT_HANDLES_QUERY,
        variables: { first, after },
        next: { revalidate: 3600 },
      });
      for (const edge of data.products.edges) {
        const h = edge.node?.handle;
        if (h && !EXCLUDE_PRODUCT_HANDLES_FROM_SITEMAP.has(h)) handles.push(h);
      }
      if (!data.products.pageInfo.hasNextPage || !data.products.pageInfo.endCursor) break;
      after = data.products.pageInfo.endCursor;
    }
  } catch {
    // Shopify not configured or API error; sitemap still returns other routes
  }
  return handles;
}

type ShopSettingsForSitemap = {
  shopPageCollectionSections?: Array<{ collectionHandle?: string | null }> | null;
  shopFilterOptions?: Array<{ value?: string | null }> | null;
} | null;

async function getSanitySitemapPart(): Promise<MetadataRoute.Sitemap> {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !client) return [];

  const out: MetadataRoute.Sitemap = [];
  const common = {
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.65,
  };

  try {
    const [pageSlugs, recipeSlugs, basicSlugs, shopSettings] = await Promise.all([
      client.fetch<string[]>(
        `*[_type == "page" && defined(slug.current)].slug.current`,
        {},
        { next: { revalidate: 3600 } },
      ),
      client.fetch<string[]>(
        `*[_type == "recipe" && defined(slug.current)].slug.current`,
        {},
        { next: { revalidate: 3600 } },
      ),
      client.fetch<string[]>(
        `*[_type == "basic" && defined(slug.current)].slug.current`,
        {},
        { next: { revalidate: 3600 } },
      ),
      client.fetch<ShopSettingsForSitemap>(SHOP_PAGE_SETTINGS_QUERY, {}, { next: { revalidate: 3600 } }),
    ]);

    for (const slug of pageSlugs) {
      if (!slug || RESERVED_PAGE_SLUGS.has(slug)) continue;
      const enc = encodeURIComponent(slug);
      out.push({
        url: `${baseUrl}/${enc}`,
        ...common,
        priority: 0.7,
      });
    }

    for (const slug of recipeSlugs) {
      if (!slug) continue;
      out.push({
        url: `${baseUrl}/recipes/${encodeURIComponent(slug)}`,
        ...common,
        priority: 0.75,
      });
    }

    for (const slug of basicSlugs) {
      if (!slug) continue;
      out.push({
        url: `${baseUrl}/basics/${encodeURIComponent(slug)}`,
        ...common,
        priority: 0.7,
      });
    }

    const shopSegments = new Set<string>();
    for (const s of shopSettings?.shopPageCollectionSections ?? []) {
      const h = s.collectionHandle?.trim();
      if (h) shopSegments.add(shopPathSegmentFromValue(h));
    }
    for (const f of shopSettings?.shopFilterOptions ?? []) {
      const v = f.value?.trim();
      if (v) shopSegments.add(shopPathSegmentFromValue(v));
    }
    for (const seg of shopSegments) {
      out.push({
        url: `${baseUrl}/shop/${seg}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.85,
      });
    }
  } catch {
    // Sanity optional; rest of sitemap still builds
  }

  return out;
}

function mergeUnique(entries: MetadataRoute.Sitemap[]): MetadataRoute.Sitemap {
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const list of entries) {
    for (const e of list) {
      if (!byUrl.has(e.url)) byUrl.set(e.url, e);
    }
  }
  return [...byUrl.values()];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/recipes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/basics`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.55 },
    { url: `${baseUrl}/calendar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];

  const [productHandles, sanityPart] = await Promise.all([
    getAllProductHandles(),
    getSanitySitemapPart(),
  ]);

  const productUrls: MetadataRoute.Sitemap = productHandles.map((handle) => ({
    url: `${baseUrl}/products/${encodeURIComponent(handle)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return mergeUnique([staticRoutes, sanityPart, productUrls]);
}
