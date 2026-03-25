import { getPetTreatCollectionHandles } from "@/lib/petTreatCollectionHandles";

/**
 * Hide seafood recipe promos on pet / pet-treat products.
 *
 * 1. **Collection (preferred)** — product is in a configured “pet treat” collection; managed in Shopify Admin.
 * 2. **Fallback** — title / product handle / tags / product type heuristics for items not yet in that collection.
 */
export function isPetProductPage(product: {
  title?: string | null;
  handle?: string | null;
  productType?: string | null;
  tags?: string[];
  collections?: {
    edges?: Array<{ node?: { handle?: string | null } | null } | null>;
  };
}): boolean {
  const petCollectionHandles = getPetTreatCollectionHandles();
  const productCollectionHandles = (product.collections?.edges ?? [])
    .map((e) => e?.node?.handle?.toLowerCase().trim())
    .filter((h): h is string => Boolean(h));
  for (const h of productCollectionHandles) {
    if (petCollectionHandles.includes(h)) return true;
  }

  const title = (product.title ?? "").toLowerCase();
  const handle = (product.handle ?? "").toLowerCase();

  // Title: common merchandising copy even when Shopify type/tags are generic
  if (
    /\bpet treat/.test(title) ||
    /\bpet treats\b/.test(title) ||
    /\bdog treat/.test(title) ||
    /\bcat treat/.test(title) ||
    /\bfor dogs?\b/.test(title) ||
    /\bfor cats?\b/.test(title) ||
    /\bfor pets?\b/.test(title)
  ) {
    return true;
  }

  // Handle: URL slug often matches collection (e.g. pet-treats, freeze-dried-salmon-pet-treats)
  if (
    handle.includes("pet-treat") ||
    handle.includes("pet-treats") ||
    handle.includes("pet-food") ||
    /(^|-)pet-/.test(handle) ||
    handle.includes("-pet-")
  ) {
    return true;
  }

  const pt = (product.productType ?? "").toLowerCase();
  if (/\bpet\b/.test(pt) || pt.includes("pet treat")) return true;

  for (const t of product.tags ?? []) {
    const s = (t ?? "").toLowerCase().trim();
    if (!s) continue;
    if (s === "pet" || s.includes("pet treat") || /^pet[-\s]/i.test(s)) {
      return true;
    }
  }
  return false;
}
