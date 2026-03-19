/**
 * List Klaviyo reviews for a product, or list review counts for all products.
 *
 * Usage:
 *   npx tsx scripts/klaviyo-reviews-by-product.ts <productId|handle>   # one product's reviews
 *   npx tsx scripts/klaviyo-reviews-by-product.ts --all               # counts per product (via Shopify product list)
 *
 * Prerequisites: KLAVIYO_PRIVATE_API_KEY in .env.local
 * For --all and for resolving handle: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local
 */

import { readFileSync } from "fs";
import { resolve } from "path";

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
  /* .env.local optional */
}

const KLAVIYO_REVIEWS_URL = "https://a.klaviyo.com/api/reviews";
const REVISION = "2026-01-15";

type KlaviyoReviewResource = {
  type: string;
  id: string;
  attributes?: {
    rating?: number;
    author?: string;
    content?: string;
    title?: string;
    created?: string;
    status?: { value?: string };
    review_type?: string;
  };
};

type KlaviyoReviewsResponse = {
  data?: KlaviyoReviewResource[];
  meta?: { count?: number };
  links?: { next?: string };
};

function shopifyProductIdFromGid(gid: string): string | null {
  const match = /^gid:\/\/shopify\/Product\/(\d+)$/.exec(gid?.trim() ?? "");
  return match ? match[1]! : null;
}

async function getProductIdFromHandle(handle: string): Promise<string | null> {
  const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  if (!domain || !token) return null;
  const url = `https://${domain}/api/2024-10/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-shopify-storefront-access-token": token,
    },
    body: JSON.stringify({
      query: `query($handle: String!) { productByHandle(handle: $handle) { id } }`,
      variables: { handle },
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { productByHandle?: { id?: string } } };
  const gid = json.data?.productByHandle?.id ?? null;
  return gid ? shopifyProductIdFromGid(gid) : null;
}

async function fetchReviewsForProduct(numericProductId: string): Promise<{ count: number; reviews: KlaviyoReviewResource[] }> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY?.trim();
  if (!apiKey) throw new Error("Missing KLAVIYO_PRIVATE_API_KEY in .env.local");

  const itemId = `$shopify:::$default:::${numericProductId}`;
  const filter = `and(equals(status,'published'),equals(item.id,"${itemId}"))`;
  const all: KlaviyoReviewResource[] = [];
  let nextUrl: string | null = `${KLAVIYO_REVIEWS_URL}?${new URLSearchParams({
    filter,
    "fields[review]": "rating,author,content,title,created,review_type,status",
    "page[size]": "100",
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
    });
    if (!res.ok) throw new Error(`Klaviyo API error: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as KlaviyoReviewsResponse;
    const list = json.data ?? [];
    all.push(...list);
    const next = json.links?.next;
    nextUrl = next ? (next.startsWith("http") ? next : `${new URL(KLAVIYO_REVIEWS_URL).origin}${next}`) : null;
  }
  return { count: all.length, reviews: all };
}

async function fetchShopifyProductHandles(): Promise<Array<{ id: string; handle: string; title: string }>> {
  const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  if (!domain || !token) return [];
  const url = `https://${domain}/api/2024-10/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-shopify-storefront-access-token": token,
    },
    body: JSON.stringify({
      query: `query { products(first: 250) { edges { node { id title handle } } } }`,
    }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  const rawEdges = json?.data?.products?.edges ?? [];
  const out: Array<{ id: string; handle: string; title: string }> = [];
  for (const e of rawEdges) {
    const node = e?.node;
    if (!node) continue;
    const id = shopifyProductIdFromGid(node.id) ?? node.id;
    if (!id) continue;
    out.push({ id, handle: node.handle ?? "", title: node.title ?? "" });
  }
  return out;
}

async function main() {
  const arg = process.argv[2];
  if (arg === "--all") {
    const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY?.trim();
    if (!apiKey) throw new Error("Missing KLAVIYO_PRIVATE_API_KEY in .env.local");
    const products = await fetchShopifyProductHandles();
    if (products.length === 0) {
      console.log("No products from Shopify. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local");
      return;
    }
    console.log(`Review counts for ${products.length} products:\n`);
    for (const p of products) {
      const { count } = await fetchReviewsForProduct(p.id);
      if (count > 0) console.log(`${p.handle} (${p.title}): ${count} reviews`);
    }
    return;
  }

  if (!arg) {
    console.log("Usage:");
    console.log("  npx tsx scripts/klaviyo-reviews-by-product.ts <productId|handle>   # one product's reviews");
    console.log("  npx tsx scripts/klaviyo-reviews-by-product.ts --all               # counts per product");
    return;
  }

  let numericId: string | null;
  if (/^\d+$/.test(arg)) {
    numericId = arg;
  } else {
    numericId = await getProductIdFromHandle(arg);
    if (!numericId) {
      console.error("Could not resolve product handle. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local");
      process.exit(1);
    }
  }

  const { count, reviews } = await fetchReviewsForProduct(numericId);
  console.log(`Product ID ${numericId}: ${count} published review(s)\n`);
  reviews.forEach((r, i) => {
    const a = r.attributes ?? {};
    const date = a.created ? new Date(a.created).toLocaleDateString() : "";
    console.log(`--- Review ${i + 1} (${a.rating ?? "?"}★) ${date} by ${a.author ?? "—"}`);
    console.log((a.title ? `${a.title}\n` : "") + (a.content ?? "").slice(0, 200) + (a.content && a.content.length > 200 ? "…" : ""));
    console.log("");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
