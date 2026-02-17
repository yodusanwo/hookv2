/**
 * Fetch the last three published 5-star reviews from Klaviyo Reviews API.
 * Use only server-side (API route or server component). Never expose KLAVIYO_PRIVATE_API_KEY to the client.
 */

export type MappedReview = {
  stars: number;
  text: string;
  name: string;
  date: string;
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
};

const KLAVIYO_REVIEWS_URL = "https://a.klaviyo.com/api/reviews";
const REVISION = "2026-01-15";
const PAGE_SIZE = 3;

function formatDisplayDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  try {
    const d = new Date(isoDate);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  } catch {
    return "";
  }
}

function mapKlaviyoToReview(r: KlaviyoReviewResource): MappedReview | null {
  const a = r.attributes;
  const status = a.status?.value;
  if (status !== "published" && status !== "featured") return null;
  if (a.review_type === "question") return null;

  const rating = a.rating != null && a.rating >= 1 && a.rating <= 5 ? a.rating : 0;
  const content = [a.title, a.content].filter(Boolean).join(" ").trim() || "";
  if (!content && rating === 0) return null;

  return {
    stars: rating,
    text: content,
    name: (a.author ?? "").trim() || "Customer",
    date: formatDisplayDate(a.created),
  };
}

async function fetchKlaviyoReviewsUncached(): Promise<MappedReview[]> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY?.trim();
  if (!apiKey) return [];

  const params = new URLSearchParams({
    "filter": "and(equals(status,'published'),equals(rating,5))",
    "fields[review]": "rating,author,content,title,created,review_type,status",
    "page[size]": String(PAGE_SIZE),
    "sort": "-created",
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
  return list.map(mapKlaviyoToReview).filter((r): r is MappedReview => r != null);
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
    { revalidate: 60 }
  );
  return cached();
}
