/**
 * Delete a Sanity document by ID.
 * Usage: npx tsx scripts/delete-sanity-document.ts <documentId>
 *
 * Prerequisites: SANITY_API_WRITE_TOKEN in .env.local
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
const token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error("Need NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const docId = process.argv[2];
if (!docId) {
  console.error("Usage: npx tsx scripts/delete-sanity-document.ts <documentId>");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
} as { projectId: string; dataset: string; apiVersion: string; useCdn: boolean; token: string });

async function run() {
  try {
    await client.delete(docId);
    console.log(`✓ Deleted document: ${docId}`);
  } catch (err) {
    console.error("Delete failed:", err);
    process.exit(1);
  }
}

(async () => {
  await run();
})();
