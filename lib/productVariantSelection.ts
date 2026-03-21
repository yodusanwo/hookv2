export type ProductVariantOption = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  price: { amount: string; currencyCode: string };
};

export function getVariantByOptions(
  variants: ProductVariantOption[],
  selected: Record<string, string>,
): ProductVariantOption | undefined {
  return variants.find((v) =>
    v.selectedOptions.every((o) => selected[o.name] === o.value),
  );
}

export function getInitialSelectedOptions(
  variants: ProductVariantOption[],
): Record<string, string> {
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
