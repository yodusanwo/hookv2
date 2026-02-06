/**
 * Publish the Home page draft to live (same as clicking Publish in Studio).
 *
 * Run: npx tsx scripts/publish-home.ts
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

if (!projectId || !token) {
  console.error(
    "Missing Sanity env vars. Add NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN (or SANITY_API_WRITE_TOKEN) to .env.local"
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

async function publishHome() {
  const draftId = "drafts.home";
  const publishedId = "home";

  const draft = await client.getDocument(draftId);
  if (!draft) {
    console.log("No draft found for Home. Publishing the current published version (no changes).");
    const published = await client.getDocument(publishedId);
    if (!published) {
      console.error("Home page not found. Run: npx tsx scripts/seed-homepage.ts");
      process.exit(1);
    }
    return;
  }

  const { _id, ...rest } = draft;
  await client.createOrReplace({
    ...rest,
    _id: publishedId,
    _type: draft._type,
  });

  console.log("✓ Home page published. Your site will show the latest content.");
}

publishHome().catch((err) => {
  console.error("Publish failed:", err);
  process.exit(1);
});
