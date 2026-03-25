/**
 * PDP hides the recipe section for products in these Shopify **collection handles**
 * (Admin → Collections → collection URL slug).
 *
 * Override with `NEXT_PUBLIC_PET_TREAT_COLLECTION_HANDLES` (comma-separated), e.g.
 * `pet-treats,pet-treat-collection`. Defaults to `pet-treats` if unset.
 */
export function getPetTreatCollectionHandles(): string[] {
  const raw =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_PET_TREAT_COLLECTION_HANDLES?.trim() ?? ""
      : "";
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  return ["pet-treats"];
}
