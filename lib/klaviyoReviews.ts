/**
 * Fetch the last three published 5-star reviews from Klaviyo Reviews API.
 * Use only server-side (API route or server component). Never expose KLAVIYO_PRIVATE_API_KEY to the client.
 */

import { cache } from "react";

export type MappedReview = {
  stars: number;
  text: string;
  name: string;
  date: string;
  /** ISO date string for sorting (newest first). */
  createdAt?: string;
};

type KlaviyoReviewAttributes = {
  rating?: number | null;
  author?: string | null;
  content?: string | null;
  title?: string | null;
  created?: string | null;
  review_type?: string | null;
  status?: { value?: string } | null;
};

type KlaviyoReviewResource = {
  type: string;
  id: string;
  attributes: KlaviyoReviewAttributes;
};

type KlaviyoReviewsResponse = {
  data?: KlaviyoReviewResource[];
  meta?: { count?: number };
  links?: { next?: string };
};

const KLAVIYO_REVIEWS_URL = "https://a.klaviyo.com/api/reviews";
const REVISION = "2026-01-15";
const PAGE_SIZE = 3;
/** Page size when fetching section reviews (Klaviyo often allows up to 100). */
const SECTION_REVIEWS_PAGE_SIZE = 100;
/** Max pages to fetch for section reviews (avoids runaway requests). */
const SECTION_REVIEWS_MAX_PAGES = 25;

function formatDisplayDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  try {
    const d = new Date(isoDate);
    return isNaN(d.getTime())
      ? ""
      : d.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        });
  } catch {
    return "";
  }
}

function mapKlaviyoToReview(r: KlaviyoReviewResource): MappedReview | null {
  const a = r.attributes;
  const status = a.status?.value;
  if (status !== "published" && status !== "featured") return null;
  if (a.review_type === "question") return null;

  const rating =
    a.rating != null && a.rating >= 1 && a.rating <= 5 ? a.rating : 0;
  const content = [a.title, a.content].filter(Boolean).join(" ").trim() || "";
  if (!content && rating === 0) return null;

  return {
    stars: rating,
    text: content,
    name: (a.author ?? "").trim() || "Customer",
    date: formatDisplayDate(a.created),
    createdAt: a.created ?? undefined,
  };
}

async function fetchKlaviyoReviewsUncached(): Promise<MappedReview[]> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY?.trim();
  if (!apiKey) return [];

  const params = new URLSearchParams({
    filter: "and(equals(status,'published'),equals(rating,5))",
    "fields[review]": "rating,author,content,title,created,review_type,status",
    "page[size]": String(PAGE_SIZE),
    sort: "-created",
  });

  const url = `${KLAVIYO_REVIEWS_URL}?${params.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      Accept: "application/json",
      Revision: REVISION,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.warn("Klaviyo reviews fetch failed:", res.status, await res.text());
    return [];
  }

  const json = (await res.json()) as KlaviyoReviewsResponse;
  const list = json.data ?? [];
  const mapped = list
    .map(mapKlaviyoToReview)
    .filter((r): r is MappedReview => r != null);
  mapped.sort((a, b) => {
    const t1 = a.createdAt ?? "";
    const t2 = b.createdAt ?? "";
    return t2.localeCompare(t1);
  });
  return mapped;
}

/**
 * Returns the last three 5-star published Klaviyo reviews, mapped to { stars, text, name, date }.
 * Cached for 1 minute so new 5-star reviews appear shortly after they are published.
 * Call only from server (API route or server component).
 */
export async function getKlaviyoReviews(): Promise<MappedReview[]> {
  const { unstable_cache } = await import("next/cache");
  const cached = unstable_cache(
    fetchKlaviyoReviewsUncached,
    ["klaviyo-reviews"],
    { revalidate: 60 },
  );
  return cached();
}

async function fetchKlaviyoReviewsForSectionUncached(): Promise<MappedReview[]> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY?.trim();
  if (!apiKey) return [];

  /** All published reviews (any rating), same pool as summary — home + product carousel rotate through full set. */
  const params = new URLSearchParams({
    filter: "equals(status,'published')",
    "fields[review]": "rating,author,content,title,created,review_type,status",
    "page[size]": String(SECTION_REVIEWS_PAGE_SIZE),
    sort: "-created",
  });

  const allData: KlaviyoReviewResource[] = [];
  let nextUrl: string | null = `${KLAVIYO_REVIEWS_URL}?${params.toString()}`;
  let pages = 0;

  while (nextUrl && pages < SECTION_REVIEWS_MAX_PAGES) {
    const res = await fetch(nextUrl, {
      method: "GET",
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        Accept: "application/json",
        Revision: REVISION,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn("Klaviyo section reviews fetch failed:", res.status, await res.text());
      break;
    }

    const json = (await res.json()) as KlaviyoReviewsResponse;
    const list = json.data ?? [];
    allData.push(...list);

    const next = json.links?.next;
    nextUrl = next
      ? next.startsWith("http")
        ? next
        : `${new URL(KLAVIYO_REVIEWS_URL).origin}${next}`
      : null;
    pages += 1;
    if (list.length < SECTION_REVIEWS_PAGE_SIZE) break;
  }

  const mapped = allData
    .map(mapKlaviyoToReview)
    .filter((r): r is MappedReview => r != null);
  mapped.sort((a, b) => {
    const t1 = a.createdAt ?? "";
    const t2 = b.createdAt ?? "";
    return t2.localeCompare(t1);
  });
  return mapped;
}

/**
 * Returns published Klaviyo reviews for the reviews carousel (home, product page, etc.).
 * Paginates through all published reviews (any rating). Cached 1 minute. Server-only.
 */
export async function getKlaviyoReviewsForSection(): Promise<MappedReview[]> {
  const { unstable_cache } = await import("next/cache");
  const cached = unstable_cache(
    fetchKlaviyoReviewsForSectionUncached,
    ["klaviyo-reviews-section", "v2-all-published"],
    { revalidate: 60 },
  );
  return cached();
}

export type ReviewsSummary = { totalCount: number; averageRating: number };

const SUMMARY_PAGE_SIZE = 100;
const SUMMARY_MAX_PAGES = 5;

async function fetchKlaviyoReviewsSummaryUncached(): Promise<ReviewsSummary> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY?.trim();
  if (!apiKey) return { totalCount: 0, averageRating: 0 };

  const params = new URLSearchParams({
    filter: "equals(status,'published')",
    "fields[review]": "rating,review_type,status",
    "page[size]": String(SUMMARY_PAGE_SIZE),
    sort: "-created",
  });

  let totalCount = 0;
  let totalCountLockedFromMeta = false;
  let sumRating = 0;
  let totalWithRating = 0;
  let nextUrl: string | null = `${KLAVIYO_REVIEWS_URL}?${params.toString()}`;
  let pages = 0;

  while (nextUrl && pages < SUMMARY_MAX_PAGES) {
    const res = await fetch(nextUrl, {
      method: "GET",
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        Accept: "application/json",
        Revision: REVISION,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) break;

    const json = (await res.json()) as KlaviyoReviewsResponse;
    const list = json.data ?? [];

    if (pages === 0 && json.meta?.count != null) {
      totalCount = json.meta.count;
      totalCountLockedFromMeta = true;
    } else if (!totalCountLockedFromMeta) {
      totalCount += list.length;
    }

    for (const r of list) {
      const a = r.attributes;
      if (a.review_type === "question") continue;
      const rating =
        a.rating != null && a.rating >= 1 && a.rating <= 5 ? a.rating : 0;
      if (rating > 0) {
        sumRating += rating;
        totalWithRating += 1;
      }
    }

    const next = json.links?.next;
    nextUrl = next
      ? next.startsWith("http")
        ? next
        : `${new URL(KLAVIYO_REVIEWS_URL).origin}${next}`
      : null;
    pages += 1;
    if (list.length < SUMMARY_PAGE_SIZE) break;
  }

  if (totalCount === 0 && totalWithRating > 0) totalCount = totalWithRating;
  const averageRating =
    totalWithRating > 0 ? Math.round((sumRating / totalWithRating) * 10) / 10 : 0;

  return { totalCount, averageRating };
}

/**
 * Returns total count and average rating of published Klaviyo reviews (all ratings).
 * Used for the reviews section summary card. Cached 1 minute.
 * Call only from server.
 */
export async function getKlaviyoReviewsSummary(): Promise<ReviewsSummary> {
  const { unstable_cache } = await import("next/cache");
  const cached = unstable_cache(
    fetchKlaviyoReviewsSummaryUncached,
    ["klaviyo-reviews-summary"],
    { revalidate: 60 },
  );
  return cached();
}

/** Extract numeric Shopify product ID from GID (e.g. gid://shopify/Product/123 -> 123). */
function shopifyProductIdFromGid(gid: string): string | null {
  const match = /^gid:\/\/shopify\/Product\/(\d+)$/.exec(gid?.trim() ?? "");
  return match ? match[1]! : null;
}

/**
 * Klaviyo Reviews API `item.id` for a Shopify catalog product.
 * Default catalog is `$default`; override with `KLAVIYO_SHOPIFY_REVIEWS_CATALOG_ID` if your account uses another catalog.
 * @see https://developers.klaviyo.com/en/reference/get_reviews
 */
export function shopifyProductReviewItemId(numericShopifyProductId: string): string {
  const catalog =
    process.env.KLAVIYO_SHOPIFY_REVIEWS_CATALOG_ID?.trim() || "$default";
  return `$shopify:::${catalog}:::${numericShopifyProductId}`;
}

function publishedReviewsFilterForShopifyProduct(numericShopifyProductId: string): string {
  const itemId = shopifyProductReviewItemId(numericShopifyProductId);
  return `and(equals(status,'published'),equals(item.id,"${itemId}"))`;
}

const PRODUCT_REVIEWS_PAGE_SIZE = 6;

/**
 * Fetches published Klaviyo reviews for a single product.
 * @param shopifyProductGid - Shopify product GID from Storefront API (e.g. gid://shopify/Product/123).
 * @returns Up to PRODUCT_REVIEWS_PAGE_SIZE reviews for that product, sorted by created desc.
 * Call only from server (API route or server component).
 */
export async function getKlaviyoReviewsForProduct(
  shopifyProductGid: string,
): Promise<MappedReview[]> {
  const numericId = shopifyProductIdFromGid(shopifyProductGid);
  if (!numericId) return [];

  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY?.trim();
  if (!apiKey) return [];

  const filter = publishedReviewsFilterForShopifyProduct(numericId);

  const params = new URLSearchParams({
    filter,
    "fields[review]": "rating,author,content,title,created,review_type,status",
    "page[size]": String(PRODUCT_REVIEWS_PAGE_SIZE),
    sort: "-created",
  });

  const url = `${KLAVIYO_REVIEWS_URL}?${params.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      Accept: "application/json",
      Revision: REVISION,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.warn(
      "Klaviyo product reviews fetch failed:",
      res.status,
      await res.text(),
    );
    return [];
  }

  const json = (await res.json()) as KlaviyoReviewsResponse;
  const list = json.data ?? [];
  const mapped = list
    .map(mapKlaviyoToReview)
    .filter((r): r is MappedReview => r != null);
  mapped.sort((a, b) => {
    const t1 = a.createdAt ?? "";
    const t2 = b.createdAt ?? "";
    return t2.localeCompare(t1);
  });
  return mapped;
}

/**
 * Total count and average rating for published Klaviyo reviews linked to one Shopify product.
 * Uses the same `item.id` filter as {@link getKlaviyoReviewsForProduct}. Cached via fetch revalidate.
 * Wrapped with React `cache()` so parallel PDP calls (hero count + reviews section) dedupe per request.
 */
export const getKlaviyoReviewSummaryForProduct = cache(
  async function getKlaviyoReviewSummaryForProduct(
  shopifyProductGid: string,
): Promise<ReviewsSummary> {
  const numericId = shopifyProductIdFromGid(shopifyProductGid);
  if (!numericId) return { totalCount: 0, averageRating: 0 };

  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY?.trim();
  if (!apiKey) return { totalCount: 0, averageRating: 0 };

  const filter = publishedReviewsFilterForShopifyProduct(numericId);
  const params = new URLSearchParams({
    filter,
    "fields[review]": "rating,review_type,status",
    "page[size]": String(SUMMARY_PAGE_SIZE),
    sort: "-created",
  });

  let totalCount = 0;
  let totalCountLockedFromMeta = false;
  let sumRating = 0;
  let totalWithRating = 0;
  let nextUrl: string | null = `${KLAVIYO_REVIEWS_URL}?${params.toString()}`;
  let pages = 0;

  while (nextUrl && pages < SUMMARY_MAX_PAGES) {
    const res = await fetch(nextUrl, {
      method: "GET",
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        Accept: "application/json",
        Revision: REVISION,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) break;

    const json = (await res.json()) as KlaviyoReviewsResponse;
    const list = json.data ?? [];

    if (pages === 0 && json.meta?.count != null) {
      totalCount = json.meta.count;
      totalCountLockedFromMeta = true;
    } else if (!totalCountLockedFromMeta) {
      totalCount += list.length;
    }

    for (const r of list) {
      const a = r.attributes;
      if (a.review_type === "question") continue;
      const rating =
        a.rating != null && a.rating >= 1 && a.rating <= 5 ? a.rating : 0;
      if (rating > 0) {
        sumRating += rating;
        totalWithRating += 1;
      }
    }

    const next = json.links?.next;
    nextUrl = next
      ? next.startsWith("http")
        ? next
        : `${new URL(KLAVIYO_REVIEWS_URL).origin}${next}`
      : null;
    pages += 1;
    if (list.length < SUMMARY_PAGE_SIZE) break;
  }

  if (totalCount === 0 && totalWithRating > 0) totalCount = totalWithRating;
  const averageRating =
    totalWithRating > 0
      ? Math.round((sumRating / totalWithRating) * 10) / 10
      : 0;

  return { totalCount, averageRating };
});

const COUNT_PAGE_SIZE = 100;

/**
 * Returns the total count of published Klaviyo reviews for a single product.
 * Call only from server (API route or server component).
 */
export async function getKlaviyoReviewCountForProduct(
  shopifyProductGid: string,
): Promise<number> {
  const numericId = shopifyProductIdFromGid(shopifyProductGid);
  if (!numericId) return 0;

  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY?.trim();
  if (!apiKey) return 0;

  const filter = publishedReviewsFilterForShopifyProduct(numericId);

  let total = 0;
  let nextUrl: string | null = `${KLAVIYO_REVIEWS_URL}?${new URLSearchParams({
    filter,
    "fields[review]": "id",
    "page[size]": String(COUNT_PAGE_SIZE),
    sort: "-created",
  })}`;

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      method: "GET",
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        Accept: "application/json",
        Revision: REVISION,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) break;

    const json = (await res.json()) as KlaviyoReviewsResponse;
    const list = json.data ?? [];
    if (json.meta?.count != null) {
      return json.meta.count;
    }
    total += list.length;
    const next = json.links?.next;
    nextUrl = next
      ? next.startsWith("http")
        ? next
        : `${new URL(KLAVIYO_REVIEWS_URL).origin}${next}`
      : null;
  }

  return total;
}

/**
 * All Klaviyo review fetches needed for the PDP (section pool, store summary, product-scoped list + summary).
 * Call once per product page; pairs with {@link derivePdpReviewCarouselState} for display props.
 */
export async function getPdpReviewData(shopifyProductGid: string): Promise<{
  sectionReviews: MappedReview[];
  storeReviewSummary: ReviewsSummary;
  productReviewsForCarousel: MappedReview[];
  productScopedReviewSummary: ReviewsSummary;
}> {
  const [
    sectionReviews,
    storeReviewSummary,
    productReviewsForCarousel,
    productScopedReviewSummary,
  ] = await Promise.all([
    getKlaviyoReviewsForSection(),
    getKlaviyoReviewsSummary(),
    getKlaviyoReviewsForProduct(shopifyProductGid),
    getKlaviyoReviewSummaryForProduct(shopifyProductGid),
  ]);
  return {
    sectionReviews,
    storeReviewSummary,
    productReviewsForCarousel,
    productScopedReviewSummary,
  };
}
