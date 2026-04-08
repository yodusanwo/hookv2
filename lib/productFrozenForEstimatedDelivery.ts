/** Tag that forces ambient (non-frozen) delivery settings when present. */
export const ESTIMATED_DELIVERY_AMBIENT_TAG = "ambient" as const;

/** Tags that indicate frozen-line products for estimated delivery. */
export const ESTIMATED_DELIVERY_FROZEN_TAGS = ["frozen", "frozenseafood"] as const;

export type ProductFrozenForEstimatedDeliveryInput = {
  tags: string[];
  /** `custom.is_frozen` metafield value from Storefront API. */
  isFrozenMetafield: string | null | undefined;
  productType: string | null | undefined;
};

/**
 * Whether the PDP should use frozen vs ambient processing/transit from Sanity.
 *
 * Precedence:
 * 1. Tag `ambient` → not frozen (explicit opt-out).
 * 2. Metafield `custom.is_frozen` === "true" → frozen.
 * 3. Tag `frozen` or `frozenseafood` → frozen.
 * 4. `productType` contains "frozen" → frozen.
 *
 * If both `ambient` and frozen tags exist, ambient wins.
 */
export function productIsFrozenForEstimatedDelivery(
  input: ProductFrozenForEstimatedDeliveryInput,
): boolean {
  const tagSet = new Set(
    input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
  );
  if (tagSet.has(ESTIMATED_DELIVERY_AMBIENT_TAG)) return false;
  if (input.isFrozenMetafield?.trim().toLowerCase() === "true") return true;
  for (const ft of ESTIMATED_DELIVERY_FROZEN_TAGS) {
    if (tagSet.has(ft)) return true;
  }
  return (input.productType?.toLowerCase() ?? "").includes("frozen");
}
