/**
 * Fetch product handles from Shopify and add them to the Sanity Home page Deal & Promotions section.
 *
 * Run: npx tsx scripts/add-product-handles.ts
 */

import { createClient } from "next-sanity";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  try {
    const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1]!.trim();
        const value = match[2]!.trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    }
  } catch {}
}

loadEnvLocal();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token =
  process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_API_TOKEN;
const storeDomain = (process.env.SHOPIFY_STORE_DOMAIN || "").replace(
  /^https?:\/\//,
  ""
);
const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-10";

if (!projectId || !token) {
  console.error("Missing Sanity env vars (NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_API_TOKEN)");
  process.exit(1);
}

if (!storeDomain || !storefrontToken) {
  console.error("Missing Shopify env vars (SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN)");
  process.exit(1);
}

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
} as { projectId: string; dataset: string; apiVersion: string; useCdn: boolean; token: string });

async function fetchShopifyHandles(): Promise<string[]> {
  const url = `https://${storeDomain}/api/${apiVersion}/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-storefront-access-token": storefrontToken!,
    },
    body: JSON.stringify({
      query: `
        query GetProducts($first: Int!) {
          products(first: $first) {
            edges {
              node {
                handle
              }
            }
          }
        }
      `,
      variables: { first: 12 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Shopify API failed: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Shopify: ${json.errors.map((e: { message: string }) => e.message).join("; ")}`);
  }

  const edges = json.data?.products?.edges ?? [];
  return edges.map((e: { node: { handle: string } }) => e.node.handle);
}

async function addHandles() {
  try {
    const handles = await fetchShopifyHandles();
    console.log(`✓ Fetched ${handles.length} product handles from Shopify:`, handles);

    const productRefs = handles.map((handle, i) => ({
      _type: "productReference",
      _key: `ref-${i}`,
      shopifyHandle: handle,
    }));

    const doc = await sanityClient.getDocument("home");
    if (!doc || !Array.isArray((doc as { sections?: unknown[] }).sections)) {
      console.error("Home page not found in Sanity. Run: npx tsx scripts/seed-homepage.ts first.");
      process.exit(1);
    }

    const sections = (doc as unknown as { sections: unknown[] }).sections as Array<{
      _type?: string;
      _key?: string;
      [k: string]: unknown;
    }>;
    const dealIdx = sections.findIndex((s) => s._type === "dealPromotionsBlock");

    if (dealIdx === -1) {
      sections.push({
        _type: "dealPromotionsBlock",
        _key: "dealPromotions",
        title: "Shop seafood",
        description: "Curated wild catch from Alaska's small-boat fleet.",
        productRefs,
        layout: "grid",
      });
    } else {
      sections[dealIdx] = {
        ...sections[dealIdx],
        productRefs,
      };
    }

    await sanityClient.createOrReplace({
      ...doc,
      sections,
    });

    console.log("✓ Updated Sanity Home page with product handles.");
    console.log("  Publish the Home page in Studio to see the Shop section.");
  } catch (err) {
    console.error("Failed:", err);
    process.exit(1);
  }
}

addHandles();
