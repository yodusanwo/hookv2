/** Shopify subscription selling plan (e.g. Appstle) linked to a variant via sellingPlanAllocations. */
export type SellingPlanOption = {
  id: string;
  name: string;
};

export type ProductVariantOption = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  price: { amount: string; currencyCode: string };
  /** When set, customer can choose Subscribe & save (Storefront `sellingPlanId` on cart line). */
  sellingPlans?: SellingPlanOption[];
  /**
   * From Storefront API `Product.requiresSellingPlan` (same for all variants on the product).
   * When true, the product cannot be sold without a selling plan — hide one-time purchase.
   */
  requiresSellingPlan?: boolean;
};

export function getVariantByOptions(
  variants: ProductVariantOption[],
  selected: Record<string, string>,
): ProductVariantOption | undefined {
  return variants.find((v) =>
    v.selectedOptions.every((o) => selected[o.name] === o.value),
  );
}

/** Match variant by full GID or numeric ID (e.g. from ?variant=123 in URL). */
function variantMatchesId(v: ProductVariantOption, id: string): boolean {
  if (v.id === id) return true;
  const num = id.replace(/\D/g, "");
  if (num && v.id.endsWith("/" + num)) return true;
  return false;
}

export function getInitialSelectedOptions(
  variants: ProductVariantOption[],
  variantId?: string | null,
): Record<string, string> {
  if (variantId?.trim()) {
    const byId = variants.find((v) => variantMatchesId(v, variantId.trim()));
    if (byId) {
      const s: Record<string, string> = {};
      for (const o of byId.selectedOptions ?? []) s[o.name] = o.value;
      return s;
    }
  }
  const first = variants.find((v) => v.availableForSale) ?? variants[0];
  const s: Record<string, string> = {};
  for (const o of first?.selectedOptions ?? []) s[o.name] = o.value;
  return s;
}

/** Line under product title: variant title, or option values, or product title. */
export function formatVariantSubtitle(
  productTitle: string,
  variant: ProductVariantOption | undefined,
): string {
  if (!variant) return productTitle;
  const t = variant.title?.trim() ?? "";
  if (t && t !== "Default Title") return t;
  const parts =
    variant.selectedOptions?.map((o) => o.value).filter(Boolean) ?? [];
  if (parts.length > 0) return parts.join(" / ");
  return productTitle;
}
