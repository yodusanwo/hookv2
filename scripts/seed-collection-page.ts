/**
 * Seed a Sanity Collection Page with the same sections as the Home page.
 * Use this as the default "Category" page under Collection Page in Studio.
 *
 * Prerequisites:
 * 1. Add SANITY_API_WRITE_TOKEN to .env.local (from sanity.io/manage → API → Tokens)
 * 2. Run: npx tsx scripts/seed-collection-page.ts
 *
 * Optional: pass a collection handle to match your Shopify collection:
 *   npx tsx scripts/seed-collection-page.ts salmon
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
  } catch {
    // .env.local may not exist
  }
}

loadEnvLocal();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token =
  process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_API_TOKEN;

if (!projectId) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
  process.exit(1);
}

if (!token) {
  console.error(
    "Missing SANITY_API_WRITE_TOKEN or SANITY_API_TOKEN. Add a token to .env.local (from sanity.io/manage → API → Tokens)"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
} as { projectId: string; dataset: string; apiVersion: string; useCdn: boolean; token: string });

// Portable Text block helper (same as seed-homepage)
function ptBlock(key: string, text: string) {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: `${key}-span`,
        text,
        marks: [],
      },
    ],
  };
}

// Same sections as Home page
const SECTIONS = [
  {
    _type: "heroBlock",
    _key: "hero",
    headline: "Alaska's Fresh Catch Awaits —\nTaste the Adventure",
    subline: "Wild-caught • Family-run • Sustainably sourced",
    cta: { _type: "cta", label: "Shop Now", href: "#shop" },
    images: [],
  },
  {
    _type: "exploreProductsBlock",
    _key: "explore",
    title: "Catch of the day",
    description:
      "Wild Alaskan seafood boxes, fillets, and specialty cuts ranging from sockeye and sablefish to halibut, cod, scallops, and even salmon heads are offered as premium, wild-caught options. All wild. All the time.",
    filterCollections: [
      { label: "Seafood", collectionHandle: "seafood" },
      { label: "Subscription Box", collectionHandle: "subscription-box" },
      { label: "Pet Treats, Merch, Gift Cards", collectionHandle: "pet-treats" },
    ],
    productRefs: [],
    cta: { label: "SHOP FULL LINEUP →", href: "#shop" },
  },
  {
    _type: "catchOfTheDayBlock",
    _key: "catchOfTheDay",
    title: "CATCH OF THE DAY",
    description:
      "Wild Alaskan seafood boxes, fillets, and specialty cuts ranging from sockeye and sablefish to halibut, cod, scallops, and even salmon heads are offered as premium, wild-caught options. All wild. All the time.",
    filterCollections: [
      { label: "Seafood", collectionHandle: "seafood" },
      { label: "Subscription Box", collectionHandle: "subscription-box" },
      { label: "Pet Treats, Merch, Gift Cards", collectionHandle: "pet-treats" },
    ],
    cta: { label: "SHOP FULL LINEUP →", href: "#shop" },
  },
  {
    _type: "ourStoryBlock",
    _key: "ourStory",
    title: "We are Hook Point",
    subheading: "Why Wild Matters",
    body: [
      ptBlock(
        "p1",
        "At Hook Point Fisheries, fishing isn't just a job—it's our way of life. Every summer we carefully fish the waters off Kodiak Island, hand-harvesting wild Alaskan salmon and other seafood for folks like you."
      ),
      ptBlock(
        "p2",
        "We believe the real food brings people together, and when you choose our salmon, you're supporting sustainable harvest, local families, and small boat fisheries."
      ),
    ],
    image: undefined,
    cta: { _type: "cta", label: "Learn More About Us", href: "#learn" },
  },
  {
    _type: "dealPromotionsBlock",
    _key: "dealPromotions",
    title: "Shop seafood",
    description: "Curated wild catch from Alaska's small-boat fleet.",
    productRefs: [],
    layout: "grid",
  },
  {
    _type: "reviewsBlock",
    _key: "reviews",
    title: "Customer Reviews",
    description: "What our customers are saying",
    reviews: [
      { _key: "r1", stars: 5, text: "Best salmon I've ever had! So fresh and flavorful.", name: "Sarah M.", date: "01/15/2025" },
      { _key: "r2", stars: 5, text: "Fresh, delicious, and sustainably sourced. Highly recommend!", name: "Mike T.", date: "01/10/2025" },
      { _key: "r3", stars: 4, text: "Great quality. Will order again.", name: "Lisa K.", date: "01/05/2025" },
    ],
  },
  {
    _type: "docksideMarketsBlock",
    _key: "markets",
    title: "Find us at these Chicagoland Farmers Markets",
    description: "",
    items: [
      { _key: "m1", label: "Lincoln Park" },
      { _key: "m2", label: "Uptown" },
      { _key: "m3", label: "Lakeview" },
      { _key: "m4", label: "South Loop" },
      { _key: "m5", label: "Logan Square" },
      { _key: "m6", label: "Wicker Park" },
    ],
  },
  {
    _type: "faqBlock",
    _key: "faq",
    title: "FAQ",
    description: "",
    faqs: [
      {
        _key: "faq1",
        question: "Where do you source your fish?",
        answer:
          "We source wild-caught salmon and seafood directly from Alaska's small-boat fleet, primarily from the waters off Kodiak Island.",
      },
      {
        _key: "faq2",
        question: "How can I order?",
        answer:
          "You can order through our online shop or find us at Chicagoland farmers markets. Check our Events section for market schedules.",
      },
    ],
  },
];

async function seed() {
  const handle = process.argv[2] ?? "category";
  const document = {
    _type: "collectionPage",
    _id: `collectionPage-${handle}`,
    title: "Category",
    collectionHandle: handle,
    sections: SECTIONS,
  };

  try {
    await client.createOrReplace(document);
    console.log(`✓ Collection Page (Category) seeded successfully.`);
    console.log(`  Collection handle: "${handle}" → will render at /collections/${handle}`);
    console.log("  Open http://localhost:3000/studio → Collection Page to edit and publish.");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

(async () => {
  await seed();
})();
