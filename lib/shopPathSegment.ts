import type { CategorySectionBlockData } from "@/components/sections/CategorySectionBlock";

/**
 * Recipe ingredient field: editors may enter `salmon`, `shop/salmon`, or `/shop/salmon`.
 * Returns a single path segment for `href="/shop/[segment]"`.
 */
export function normalizeIngredientShopSegment(
  raw: string | undefined | null,
): string | null {
  let s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return null;
  s = s.replace(/^\/+|\/+$/g, "");
  if (s.toLowerCase().startsWith("shop/")) {
    s = s.slice(5);
  }
  s = s.trim();
  const first = s.split("/").filter(Boolean)[0];
  if (!first) return null;
  return first;
}

/**
 * Known Explore card labels → Shopify/Site Settings collection handles when editors omit `collectionHandle`.
 * Keys: lowercase, single spaces (see ExploreProductsSection + Sanity).
 */
const EXPLORE_LABEL_TO_COLLECTION_HANDLE: Record<string, string> = {
  seafood: "seafood",
  "smoked & specialty": "smoked-specialty",
  "smoked & speciality": "smoked-specialty",
  "pet treats, merch, gift cards": "pet-treats",
  "pet treats": "pet-treats",
};

/**
 * Resolves the shop URL segment handle for an Explore category card when `collectionHandle`
 * is missing in CMS (label-only rows otherwise link to `/shop` and show no active pill).
 */
export function exploreCollectionHandleFromFields(options: {
  collectionHandle?: string | null;
  label?: string | null;
}): string {
  const raw = options.collectionHandle?.trim();
  if (raw) return raw;
  const label = options.label?.trim();
  if (!label) return "";
  const key = label.toLowerCase().replace(/\s+/g, " ").trim();
  if (EXPLORE_LABEL_TO_COLLECTION_HANDLE[key]) {
    return EXPLORE_LABEL_TO_COLLECTION_HANDLE[key]!;
  }
  return label
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/&/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Builds the `/shop/[segment]` path piece for a collection handle or filter value.
 * Normalizes case, whitespace, and underscores (Shopify handles often use `_` while Explore links use `-`).
 */
export function shopPathSegmentFromValue(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-");
  return encodeURIComponent(normalized);
}

/**
 * Resolves a URL segment to either a collection section or a product-type filter from Sanity.
 * Prefer the same canonical encoding as {@link shopPathSegmentFromValue} (used by Explore → /shop links)
 * so `seafood`, `smoked-specialty`, and handles with `_` vs `-` all match Site Settings.
 * Collections are checked before filters when both could match.
 */
export function resolveShopPathSegment(
  rawSegment: string,
  collectionSections: CategorySectionBlockData[],
  filterOptions: Array<{ value: string }>,
): { kind: "collection"; handle: string } | { kind: "filter"; value: string } | null {
  let decoded = rawSegment.trim();
  try {
    decoded = decodeURIComponent(decoded).trim();
  } catch {
    return null;
  }
  if (!decoded) return null;

  /** Same string Explore uses in hrefs — must match shopPathSegmentFromValue(collectionHandle). */
  const targetSeg = shopPathSegmentFromValue(decoded);

  const byCanonicalColl = collectionSections.find(
    (s) => shopPathSegmentFromValue(s.collectionHandle) === targetSeg,
  );
  if (byCanonicalColl) {
    return { kind: "collection", handle: byCanonicalColl.collectionHandle };
  }

  const byCanonicalFilter = filterOptions.find(
    (f) => shopPathSegmentFromValue(f.value) === targetSeg,
  );
  if (byCanonicalFilter) {
    return { kind: "filter", value: byCanonicalFilter.value };
  }

  const decNorm = decoded
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const fuzzyColl = collectionSections.find((s) => {
    const h = s.collectionHandle
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return h === decNorm;
  });
  if (fuzzyColl) return { kind: "collection", handle: fuzzyColl.collectionHandle };

  const fuzzyFilter = filterOptions.find((f) => {
    const fv = f.value
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return fv === decNorm;
  });
  if (fuzzyFilter) return { kind: "filter", value: fuzzyFilter.value };

  return null;
}
