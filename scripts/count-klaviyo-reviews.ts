/**
 * One-off script to count reviews in Klaviyo.
 * Run from project root: npx tsx scripts/count-klaviyo-reviews.ts
 * (Or: node --loader ts-node/esm scripts/count-klaviyo-reviews.ts if you use ts-node)
 *
 * Prerequisites: KLAVIYO_PRIVATE_API_KEY in .env.local
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
try {
  const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
} catch {
  // .env.local may not exist
}

const KLAVIYO_REVIEWS_URL = "https://a.klaviyo.com/api/reviews";
const REVISION = "2026-01-15";
const PAGE_SIZE = 100;

type KlaviyoReviewResource = {
  type: string;
  id: string;
  attributes?: {
    status?: { value?: string };
    review_type?: string;
    rating?: number;
  };
};

type KlaviyoReviewsResponse = {
  data?: KlaviyoReviewResource[];
  meta?: { count?: number };
  links?: { next?: string };
};

async function countReviews(filter?: string): Promise<{ total: number; published: number }> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing KLAVIYO_PRIVATE_API_KEY in .env.local");
  }

  const params = new URLSearchParams({
    "fields[review]": "id,status,review_type,rating",
    "page[size]": String(PAGE_SIZE),
    sort: "-created",
  });
  if (filter) params.set("filter", filter);

  let total = 0;
  let published = 0;
  let nextUrl: string | null = `${KLAVIYO_REVIEWS_URL}?${params.toString()}`;

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      method: "GET",
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        Accept: "application/json",
        Revision: REVISION,
      },
    });

    if (!res.ok) {
      throw new Error(`Klaviyo API error: ${res.status} ${await res.text()}`);
    }

    const json = (await res.json()) as KlaviyoReviewsResponse;
    const list = json.data ?? [];

    for (const r of list) {
      total++;
      const status = r.attributes?.status?.value;
      if (status === "published" || status === "featured") published++;
    }

    const next = json.links?.next;
    nextUrl = next
      ? next.startsWith("http")
        ? next
        : `${new URL(KLAVIYO_REVIEWS_URL).origin}${next}`
      : null;
  }

  return { total, published };
}

async function main() {
  console.log("Counting Klaviyo reviews…\n");

  const { total, published } = await countReviews();
  console.log("Total reviews (all statuses):", total);
  console.log("Published / featured:", published);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
